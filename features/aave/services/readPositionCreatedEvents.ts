import positionCreatedAbi from 'blockchain/abi/position-created.json'
import { Context } from 'blockchain/network'
import { getTokenSymbolFromAddress } from 'blockchain/tokensMetadata'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { utils } from 'ethers'
import { LendingProtocol } from 'lendingProtocols'
import { combineLatest, from, Observable } from 'rxjs'
import { filter, map, shareReplay, startWith, switchMap } from 'rxjs/operators'
import { TypedEvent } from 'types/ethers-contracts/commons'
import { PositionCreated as PositionCreatedContract } from 'types/ethers-contracts/PositionCreated'

type PositionCreatedChainEvent = {
  collateralToken: string // address
  debtToken: string // address
  positionType: 'Multiply' | 'Earn'
  protocol: string
  proxyAddress: string
}

export type PositionCreated = {
  collateralTokenSymbol: string
  debtTokenSymbol: string
  positionType: 'Borrow' | 'Multiply' | 'Earn'
  protocol: LendingProtocol
  proxyAddress: string
}

function getPositionCreatedEventForProxyAddress$(context: Context, proxyAddress: string) {
  const positionCreatedContract = context.contractV2<PositionCreatedContract>({
    address: proxyAddress,
    abi: positionCreatedAbi,
  })

  return from(
    positionCreatedContract.queryFilter(
      {
        address: proxyAddress,
        topics: [utils.id('CreatePosition(address,string,string,address,address)')],
      },
      context.accountGuard.genesisBlock,
    ),
  )
}

function mapEvent(
  positionCreatedEvents: Array<TypedEvent<Array<any>>>[],
  context: Context,
): Array<PositionCreated> {
  return positionCreatedEvents
    .flatMap((events) => events)
    .filter((e) => e.event === 'CreatePosition')
    .map((e) => {
      const positionCreatedFromChain = (e.args as unknown) as PositionCreatedChainEvent
      return {
        ...positionCreatedFromChain,
        collateralTokenSymbol: getTokenSymbolFromAddress(
          context,
          positionCreatedFromChain.collateralToken,
        ),
        debtTokenSymbol: getTokenSymbolFromAddress(context, positionCreatedFromChain.debtToken),
        protocol: extractLendingProtocolFromPositionCreatedEvent(positionCreatedFromChain),
      }
    })
}

function extractLendingProtocolFromPositionCreatedEvent(
  positionCreatedChainEvent: PositionCreatedChainEvent,
): LendingProtocol {
  switch (positionCreatedChainEvent.protocol) {
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
    switchMap((context) =>
      getPositionCreatedEventForProxyAddress$(context, proxyAddress).pipe(
        map((events) => ({ context, events })),
      ),
    ),
    map(({ context, events }) => ({ context, event: events.pop() })),
    filter(({ event }) => event !== undefined),
    map(({ context, event }) => {
      const positionCreatedFromChain = (event!.args as unknown) as PositionCreatedChainEvent
      return {
        ...positionCreatedFromChain,
        collateralTokenSymbol: getTokenSymbolFromAddress(
          context,
          positionCreatedFromChain.collateralToken,
        ),
        debtTokenSymbol: getTokenSymbolFromAddress(context, positionCreatedFromChain.debtToken),
        protocol: extractLendingProtocolFromPositionCreatedEvent(positionCreatedFromChain),
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
          // using the contract from the context was causing issues when mutating
          // multiply position
          return getPositionCreatedEventForProxyAddress$(context, dpmProxy.proxy)
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
