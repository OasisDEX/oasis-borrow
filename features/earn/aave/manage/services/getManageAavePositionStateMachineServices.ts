import BigNumber from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import {
  AaveUserAccountData,
  AaveUserAccountDataParameters,
  AaveUserConfigurationsData,
} from '../../../../../blockchain/calls/aave/aaveLendingPool'
import {
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { AaveProtocolData, ManageAaveEvent, ManageAaveStateMachineServices } from '../state'

export function getManageAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveUserReserveData$: (args: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
  aaveUserAccountData$: (args: AaveUserAccountDataParameters) => Observable<AaveUserAccountData>,
  aaveAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveUserConfiguration$: ({
    proxyAddress,
  }: {
    proxyAddress: string
  }) => Observable<AaveUserConfigurationsData>,
  aaveReservesList$: () => Observable<AaveUserConfigurationsData>,
): ManageAaveStateMachineServices {
  function aaveProtocolData(token: string, proxyAddress: string) {
    return combineLatest(
      aaveUserReserveData$({ token, proxyAddress }),
      aaveUserAccountData$({ proxyAddress }),
      aaveAssetPriceData$({ token: 'STETH' }),
      aaveUserConfiguration$({ proxyAddress }),
      aaveReservesList$(),
    ).pipe(
      map(
        ([
          reserveData,
          accountData,
          aaveSTETHPriceData,
          aaveUserConfiguration,
          aaveReservesList,
        ]) => ({
          positionData: reserveData,
          accountData,
          aaveSTETHPriceData,
          aaveUserConfiguration,
          aaveReservesList,
        }),
      ),
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
      return await aaveProtocolData(context.token!, context.proxyAddress!).pipe(first()).toPromise()
    },
  }
}
