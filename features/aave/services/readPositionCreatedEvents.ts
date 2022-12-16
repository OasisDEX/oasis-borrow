import { combineLatest, from, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import * as positionCreatedAbi from '../../../blockchain/abi/position-created.json'
import { Context } from '../../../blockchain/network'
import { UserDpmProxy } from '../../../blockchain/userDpmProxies'
import { AccountImplementation } from '../../../types/web3-v1-contracts/account-implementation'

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
          const positionCreatedContract = context.contract<AccountImplementation>({
            address: dpmProxy.proxy,
            // the event is raised by the DPM proxy contract, but we need the position created
            // ABI to read the event
            abi: positionCreatedAbi,
          })
          return from(
            positionCreatedContract.getPastEvents('CreatePosition', {
              fromBlock: 16183119,
              toBlock: 'latest',
            }),
          )
        }),
      ).pipe(
        map((positionCreatedEvents) => {
          return positionCreatedEvents
            .flatMap((events) => events)
            .filter((e) => e.event === 'CreatePosition')
            .map((e) => e.returnValues as PositionCreatedEventPayload)
        }),
      )
    }),
  )
}
