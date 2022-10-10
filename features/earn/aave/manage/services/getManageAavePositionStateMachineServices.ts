import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
} from '../../../../../blockchain/calls/aave/aaveLendingPool'
import {
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { createPosition } from '../../../../aave'
import { AaveProtocolData, ManageAaveEvent, ManageAaveStateMachineServices } from '../state'

export function getManageAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveUserReserveData$: (args: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
  aaveUserAccountData$: (args: AaveUserAccountDataParameters) => Observable<AaveUserAccountData>,
  aaveOraclePrice$: ({ token }: { token: string }) => Observable<BigNumber>,
): ManageAaveStateMachineServices {
  function aaveProtocolData(token: string, proxyAddress: string) {
    return combineLatest(
      aaveUserReserveData$({ token, proxyAddress }),
      aaveUserAccountData$({ proxyAddress }),
      aaveOraclePrice$({ token }),
    ).pipe(
      map(([reserveData, accountData, oraclePrice]) => ({
        positionData: reserveData,
        accountData: accountData,
        oraclePrice: oraclePrice,
        position: createPosition(reserveData, accountData, oraclePrice),
      })),
    )
  }

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
    getAaveProtocolData: async (context): Promise<AaveProtocolData> => {
      const result = await aaveProtocolData(context.strategy!, context.proxyAddress!)
        .pipe(first())
        .toPromise()
      console.log(`protocol data: `, result.positionData.currentATokenBalance.toString())
      return result
    },
  }
}
