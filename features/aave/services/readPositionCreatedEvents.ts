import { ensureContractsExist, extendContract, getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getRpcProvidersForLogs, NetworkIds } from 'blockchain/networks'
import { getTokenSymbolBasedOnAddress } from 'blockchain/tokensMetadata'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { ContractDesc } from 'features/web3Context'
import { LendingProtocol } from 'lendingProtocols'
import { combineLatest, EMPTY, Observable } from 'rxjs'
import { catchError, filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { PositionCreated__factory } from 'types/ethers-contracts'
import { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

export type PositionCreated = {
  collateralTokenSymbol: string
  collateralTokenAddress: string
  debtTokenSymbol: string
  debtTokenAddress: string
  positionType: 'Borrow' | 'Multiply' | 'Earn'
  protocol: LendingProtocol
  chainId: NetworkIds
  proxyAddress: string
}

async function getPositionCreatedEventForProxyAddress(
  { chainId }: Pick<Context, 'chainId'>,
  proxyAddress: string,
): Promise<CreatePositionEvent[]> {
  const { mainProvider, forkProvider } = getRpcProvidersForLogs(chainId)

  const contracts = getNetworkContracts(chainId)
  ensureContractsExist(chainId, contracts, ['accountGuard'])
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

  return dpmWithPositionCreatedEvent.getLogs(filter)
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
        chainId,
        proxyAddress: e.args.proxyAddress,
      }
    })
}

function extractLendingProtocolFromPositionCreatedEvent(
  positionCreatedChainEvent: CreatePositionEvent,
): LendingProtocol {
  switch (positionCreatedChainEvent.args.protocol) {
    case 'AAVE':
    case 'AaveV2':
      return LendingProtocol.AaveV2
    case 'AAVE_V3':
      return LendingProtocol.AaveV3
    case 'Ajna':
    case 'AJNA_RC5':
      return LendingProtocol.Ajna
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
): Observable<PositionCreated> {
  return context$.pipe(
    switchMap(async (context) => {
      const events = await getPositionCreatedEventForProxyAddress(
        { chainId: context.chainId },
        proxyAddress,
      )
      return { context, events }
    }),
    map(({ context, events }) => ({ context, event: events.pop() })),
    filter(({ event }) => event !== undefined),
    map(({ context, event }) => {
      return {
        positionType: event!.args.positionType as 'Borrow' | 'Multiply' | 'Earn',
        collateralTokenSymbol: getTokenSymbolBasedOnAddress(
          context.chainId,
          event!.args.collateralToken,
        ),
        collateralTokenAddress: event!.args.collateralToken,
        debtTokenSymbol: getTokenSymbolBasedOnAddress(context.chainId, event!.args.debtToken),
        debtTokenAddress: event!.args.debtToken,
        protocol: extractLendingProtocolFromPositionCreatedEvent(event!),
        chainId: context.chainId,
        proxyAddress: event!.args.proxyAddress,
      }
    }),
    catchError((error) => {
      console.error(`Error while fetching last created position for proxy ${proxyAddress}`, error)
      return EMPTY
    }),
  )
}

export function createReadPositionCreatedEvents$(
  context$: Observable<Pick<Context, 'chainId'>>,
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmAccount[]>,
  walletAddress: string,
): Observable<Array<PositionCreated>> {
  return combineLatest(context$, userDpmProxies$(walletAddress)).pipe(
    switchMap(([context, dpmProxies]) => {
      return combineLatest(
        dpmProxies.map((dpmProxy) => {
          return getPositionCreatedEventForProxyAddress(context, dpmProxy.proxy)
        }),
      ).pipe(
        map((positionCreatedEvents) => {
          return mapEvent(positionCreatedEvents, context.chainId)
        }),
      )
    }),
    startWith([]),
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
      return await getPositionCreatedEventForProxyAddress(
        { chainId: context.chainId },
        dpmProxyAddress,
      )
    }),
    map((events) => {
      return events.length > 0
    }),
  )
}
