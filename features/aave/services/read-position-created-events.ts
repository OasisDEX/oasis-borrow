import { ensureContractsExist, extendContract, getNetworkContracts } from 'blockchain/contracts'
import { identifyTokens$ } from 'blockchain/identifyTokens'
import type { Context } from 'blockchain/network.types'
import type { NetworkIds } from 'blockchain/networks'
import { getRpcProvidersForLogs } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { userDpmProxies$ } from 'blockchain/userDpmProxies'
import type { ContractDesc } from 'features/web3Context'
import { LendingProtocol } from 'lendingProtocols'
import { uniq } from 'lodash'
import type { Observable } from 'rxjs'
import { combineLatest, EMPTY, of } from 'rxjs'
import { catchError, map, shareReplay, switchMap } from 'rxjs/operators'
import { PositionCreated__factory } from 'types/ethers-contracts'
import type { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

export type PositionType = 'Borrow' | 'Multiply' | 'Earn'
export type PositionCreated = {
  collateralTokenSymbol: string
  collateralTokenAddress: string
  debtTokenSymbol: string
  debtTokenAddress: string
  positionType: PositionType
  protocol: LendingProtocol
  protocolRaw: string
  chainId: NetworkIds
  proxyAddress: string
}

export async function getPositionCreatedEventForProxyAddress(
  networkId: NetworkIds,
  proxyAddress: string,
): Promise<CreatePositionEvent[]> {
  const { mainProvider, forkProvider } = getRpcProvidersForLogs(networkId)

  const contracts = getNetworkContracts(networkId)
  ensureContractsExist(networkId, contracts, ['accountGuard'])
  const { accountGuard } = contracts

  const contractDesc: ContractDesc & { genesisBlock: number } = {
    abi: [],
    address: proxyAddress,
    genesisBlock: accountGuard.genesisBlock,
  }

  const dpmWithPositionCreatedEvent = await extendContract(
    contractDesc,
    PositionCreated__factory,
    mainProvider,
    forkProvider,
  )

  const filter = dpmWithPositionCreatedEvent.filters.CreatePosition(
    proxyAddress,
    null,
    null,
    null,
    null,
  )

  return await dpmWithPositionCreatedEvent.getLogs(filter)
}

function mapEvent(
  positionCreatedEvents: CreatePositionEvent[][],
  chainId: NetworkIds,
): Array<PositionCreated> {
  return positionCreatedEvents
    .flatMap((events) => events)
    .map((e) => {
      return {
        positionType: e.args.positionType as 'Borrow' | 'Multiply' | 'Earn',
        collateralTokenSymbol: getTokenSymbolBasedOnAddress(chainId, e.args.collateralToken),
        collateralTokenAddress: e.args.collateralToken,
        debtTokenSymbol: getTokenSymbolBasedOnAddress(chainId, e.args.debtToken),
        debtTokenAddress: e.args.debtToken,
        protocol: extractLendingProtocolFromPositionCreatedEvent(e),
        protocolRaw: e.args.protocol,
        chainId,
        proxyAddress: e.args.proxyAddress,
      }
    })
}

export function extractLendingProtocolFromPositionCreatedEvent(
  positionCreatedChainEvent: CreatePositionEvent,
): LendingProtocol {
  switch (positionCreatedChainEvent.args.protocol) {
    case 'AAVE':
    case 'AaveV2':
      return LendingProtocol.AaveV2
    case 'AAVE_V3':
      return LendingProtocol.AaveV3
    case 'Spark':
      return LendingProtocol.SparkV3
    case 'Ajna':
    case 'AJNA_RC5':
    case 'Ajna_rc9':
    case 'Ajna_rc10':
    case 'Ajna_rc11':
      return LendingProtocol.Ajna
    case 'MorphoBlue':
      return LendingProtocol.MorphoBlue
    default:
      throw new Error(
        `Unrecognised protocol received from positionCreatedChainEvent ${JSON.stringify(
          positionCreatedChainEvent,
        )}`,
      )
  }
}

export function getLastCreatedPositionForProxy$(
  context$: Observable<Context>,
  proxyAddress: string,
): Observable<PositionCreated | undefined> {
  return context$.pipe(
    switchMap((context) => {
      return getLastCreatedPositionForProxy(proxyAddress, context.chainId)
    }),
    catchError((error) => {
      console.error(`Error while fetching last created position for proxy ${proxyAddress}`, error)
      return EMPTY
    }),
  )
}

export async function getLastCreatedPositionForProxy(
  proxyAddress: string,
  networkId: NetworkIds,
): Promise<PositionCreated | undefined> {
  const events = await getPositionCreatedEventForProxyAddress(networkId, proxyAddress)

  const lastEvent = events.pop()
  if (lastEvent === undefined) {
    return undefined
  }

  return {
    collateralTokenAddress: lastEvent!.args.collateralToken,
    positionType: lastEvent!.args.positionType as 'Borrow' | 'Multiply' | 'Earn',
    collateralTokenSymbol: getTokenSymbolBasedOnAddress(networkId, lastEvent!.args.collateralToken),
    debtTokenSymbol: getTokenSymbolBasedOnAddress(networkId, lastEvent!.args.debtToken),
    debtTokenAddress: lastEvent!.args.debtToken,
    protocol: extractLendingProtocolFromPositionCreatedEvent(lastEvent!),
    protocolRaw: lastEvent.args.protocol,
    chainId: networkId,
    proxyAddress: lastEvent!.args.proxyAddress,
  }
}

export function readPositionCreatedEvents$(
  walletAddress: string,
  networkId: NetworkIds,
): Observable<Array<PositionCreated>> {
  return combineLatest(userDpmProxies$(walletAddress, networkId)).pipe(
    switchMap(([dpmProxies]) =>
      combineLatest(
        dpmProxies.map((dpmProxy) =>
          getPositionCreatedEventForProxyAddress(networkId, dpmProxy.proxy),
        ),
      ),
    ),
    switchMap((positionCreatedEvents) =>
      combineLatest(
        of(positionCreatedEvents),
        identifyTokens$(
          networkId,
          uniq(
            positionCreatedEvents
              .flatMap((e) => e)
              .flatMap((e) => [e.args.collateralToken, e.args.debtToken]),
          ),
        ),
      ),
    ),
    switchMap(([positionCreatedEvents]) => of(mapEvent(positionCreatedEvents, networkId))),
    shareReplay(1),
  )
}

// returns true if the proxy has been consumed by a position, false otherwise.
export function createProxyConsumed$(
  context$: Observable<Context>,
  dpmProxyAddress: string,
): Observable<boolean> {
  return context$.pipe(
    switchMap(async (context) => {
      return await getPositionCreatedEventForProxyAddress(context.chainId, dpmProxyAddress)
    }),
    map((events) => {
      return events.length > 0
    }),
  )
}
