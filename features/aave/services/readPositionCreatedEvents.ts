import { utils } from 'ethers'
import { combineLatest, from, Observable } from 'rxjs'
import { map, startWith, switchMap } from 'rxjs/operators'

import positionCreatedAbi from '../../../blockchain/abi/position-created.json'
import { Context } from '../../../blockchain/network'
import { getTokenSymbolFromAddress } from '../../../blockchain/tokensMetadata'
import { UserDpmProxy } from '../../../blockchain/userDpmProxies'
import { PositionCreated as PositionCreatedContract } from '../../../types/ethers-contracts/PositionCreated'

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
  positionType: 'Multiply' | 'Earn'
  protocol: string
  proxyAddress: string
}

export function createReadPositionCreatedEvents$(
  context$: Observable<Context>,
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmProxy[]>,
  walletAddress: string,
): Observable<Array<PositionCreated>> {
  return combineLatest(context$, userDpmProxies$(walletAddress)).pipe(
    switchMap(([context, dpmProxies]) => {
      return combineLatest(
        dpmProxies.map((dpmProxy) => {
          // using the contract from the context was causing issues when mutating
          // multiply position
          const positionCreatedContract = context.contractV2<PositionCreatedContract>({
            address: dpmProxy.proxy,
            abi: positionCreatedAbi,
          })

          return from(
            positionCreatedContract.queryFilter(
              {
                address: dpmProxy.proxy,
                topics: [utils.id('CreatePosition(address,string,string,address,address)')],
              },
              16183119,
            ),
          )
        }),
      ).pipe(
        map((positionCreatedEvents) => {
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
                debtTokenSymbol: getTokenSymbolFromAddress(
                  context,
                  positionCreatedFromChain.debtToken,
                ),
              }
            })
        }),
      )
    }),
    startWith([]),
  )
}
