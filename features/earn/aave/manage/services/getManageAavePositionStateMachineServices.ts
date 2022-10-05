import { Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import {
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from '../../../../../blockchain/calls/aaveProtocolDataProvider'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { ManageAaveEvent, ManageAaveStateMachineServices } from '../state'

export function getManageAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveUserReserveData$: (args: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
): ManageAaveStateMachineServices {
  return {
    getBalance: (context, _): Observable<ManageAaveEvent> => {
      return tokenBalances$.pipe(
        map((balances) => {
          return balances[context.token!]
        }),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          balance: balance,
          tokenPrice: price,
        })),
      )
    },
    getProxyAddress: async (): Promise<string> => {
      const proxy = await proxyAddress$.pipe(first()).toPromise()
      if (proxy === undefined) throw new Error('Proxy address not found')
      return proxy
    },
    getAavePosition: async (context): Promise<AaveUserReserveData> => {
      return await aaveUserReserveData$({
        token: context.strategy,
        proxyAddress: context.proxyAddress!,
      })
        .pipe(first())
        .toPromise()
    },
  }
}
