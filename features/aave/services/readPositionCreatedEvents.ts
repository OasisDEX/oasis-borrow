import { getNetworkContracts } from 'blockchain/contracts'
import { Context } from 'blockchain/network'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { LendingProtocol } from 'lendingProtocols'
import { combineLatest, Observable } from 'rxjs'
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { PositionCreated__factory } from 'types/ethers-contracts'
import { CreatePositionEvent } from 'types/ethers-contracts/PositionCreated'

export type PositionCreated = {
  collateralTokenSymbol: string
  debtTokenSymbol: string
  positionType: 'Borrow' | 'Multiply' | 'Earn'
  protocol: LendingProtocol
  proxyAddress: string
}

function getPositionCreatedEventForProxyAddress(
  context: Context,
  proxyAddress: string,
): Promise<CreatePositionEvent[]> {
  const dpmWithPositionCreatedEvent = PositionCreated__factory.connect(
    proxyAddress,
    context.rpcProvider,
  )

  const filter = dpmWithPositionCreatedEvent.filters.CreatePosition(
    proxyAddress,
    null,
    null,
    null,
    null,
  )

  return dpmWithPositionCreatedEvent.queryFilter(
    filter,
    getNetworkContracts(context.chainId).accountGuard.genesisBlock,
    'latest',
  )
}

function mapEvent(
  positionCreatedEvents: CreatePositionEvent[][],
  context: Context,
): Array<PositionCreated> {
  return positionCreatedEvents
    .flatMap((events) => events)
    .map((e) => {
      return {
        positionType: e.args.positionType as 'Borrow' | 'Multiply' | 'Earn',
        collateralTokenSymbol: getTokenSymbolFromAddress(context, e.args.collateralToken),
        debtTokenSymbol: getTokenSymbolFromAddress(context, e.args.debtToken),
        protocol: extractLendingProtocolFromPositionCreatedEvent(e),
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
      return 'Ajna' as LendingProtocol
    // TODO we will need proper handling for Ajna, filtered for now
    // return LendingProtocol.Ajna
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
      const events = await getPositionCreatedEventForProxyAddress(context, proxyAddress)
      return { context, events }
    }),
    map(({ context, events }) => ({ context, event: events.pop() })),
    filter(({ event }) => event !== undefined),
    map(({ context, event }) => {
      return {
        positionType: event!.args.positionType as 'Borrow' | 'Multiply' | 'Earn',
        collateralTokenSymbol: getTokenSymbolFromAddress(context, event!.args.collateralToken),
        debtTokenSymbol: getTokenSymbolFromAddress(context, event!.args.debtToken),
        protocol: extractLendingProtocolFromPositionCreatedEvent(event!),
        proxyAddress: event!.args.proxyAddress,
      }
    }),
  )
}

export function createReadPositionCreatedEvents$(
  context$: Observable<Context>,
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
          return mapEvent(positionCreatedEvents, context)
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
  return getLastCreatedPositionForProxy$(context$, dpmProxyAddress).pipe(
    startWith(undefined),
    map((proxy) => {
      return !!proxy
    }),
  )
}
