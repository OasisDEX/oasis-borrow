import { ethers, utils } from 'ethers'
import { combineLatest, from, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import positionCreatedAbi from '../../../blockchain/abi/position-created.json'
import { Context } from '../../../blockchain/network'
import { UserDpmProxy } from '../../../blockchain/userDpmProxies'

export type PositionCreatedEventPayload = {
  collateralToken: string
  debtToken: string
  positionType: 'Multiply' | 'Earn'
  protocol: string
  proxyAddress: string
}

export function createReadPositionCreatedEvents$(
  context$: Observable<Context>,
  userDpmProxies$: (walletAddress: string) => Observable<UserDpmProxy[]>,
  walletAddress: string,
): Observable<Array<PositionCreatedEventPayload>> {
  return combineLatest(context$, userDpmProxies$(walletAddress)).pipe(
    switchMap(([context, dpmProxies]) => {
      return combineLatest(
        dpmProxies.map((dpmProxy) => {
          // using the contract from the context was causing issues when mutating
          // multiply position
          const positionCreatedContract = new ethers.Contract(
            dpmProxy.proxy,
            positionCreatedAbi,
            context.rpcProvider,
          )

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
            .map((e) => (e.args as unknown) as PositionCreatedEventPayload)
        }),
      )
    }),
  )
}
