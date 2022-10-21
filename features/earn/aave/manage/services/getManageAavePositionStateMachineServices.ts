import { IStrategy, Position } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { combineLatest, Observable } from 'rxjs'
import { first, map } from 'rxjs/operators'

import {
  AaveConfigurationData,
  AaveUserAccountData,
  AaveUserAccountDataParameters,
} from '../../../../../blockchain/calls/aave/aaveLendingPool'
import {
  AaveReserveConfigurationData,
  AaveUserReserveData,
  AaveUserReserveDataParameters,
} from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { callOperationExecutor } from '../../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { HasGasEstimation } from '../../../../../helpers/form'
import { getAdjustAaveParameters } from '../../../../aave'
import { UserSettingsState } from '../../../../userSettings/userSettings'
import { AaveProtocolData, ManageAaveEvent, ManageAaveStateMachineServices } from '../state'

export function getManageAavePositionStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  userSettings$: Observable<UserSettingsState>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveUserReserveData$: (args: AaveUserReserveDataParameters) => Observable<AaveUserReserveData>,
  aaveUserAccountData$: (args: AaveUserAccountDataParameters) => Observable<AaveUserAccountData>,
  aaveOracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<AaveReserveConfigurationData>,
  aaveOraclePrice$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveUserConfiguration$: ({
    proxyAddress,
  }: {
    proxyAddress: string
  }) => Observable<AaveConfigurationData>,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
): Observable<ManageAaveStateMachineServices> {
  function aaveProtocolData(token: string, proxyAddress: string) {
    return combineLatest(
      aaveUserReserveData$({ token, proxyAddress }),
      aaveUserAccountData$({ proxyAddress }),
      aaveOraclePrice$({ token }),
      aaveReserveConfigurationData$({ token }),
      aaveUserConfiguration$({ proxyAddress }),
      aaveReservesList$(),
    ).pipe(
      map(
        ([
          reserveData,
          accountData,
          oraclePrice,
          reserveConfigurationData,
          aaveUserConfiguration,
          aaveReservesList,
        ]) => {
          const pos = new Position(
            { amount: new BigNumber(accountData.totalDebtETH.toString()) },
            { amount: new BigNumber(reserveData.currentATokenBalance.toString()) },
            oraclePrice,
            {
              dustLimit: new BigNumber(0),
              maxLoanToValue: reserveConfigurationData.ltv,
              liquidationThreshold: reserveConfigurationData.liquidationThreshold,
            },
          )

          return {
            positionData: reserveData,
            accountData: accountData,
            oraclePrice: oraclePrice,
            position: pos,
            aaveUserConfiguration,
            aaveReservesList,
          }
        },
      ),
    )
  }

  return combineLatest(context$, userSettings$, txHelpers$).pipe(
    map(([contextConnected, userSettings, txHelpers]) => {
      return {
        getParameters: async (
          context,
        ): Promise<
          { adjustParams: IStrategy; estimatedGasPrice: HasGasEstimation } | undefined
        > => {
          if (!context.proxyAddress || !context.protocolData || !context.userInput.riskRatio)
            return undefined

          const adjustParams = await getAdjustAaveParameters(
            contextConnected,
            context.userInput.amount,
            context.userInput.riskRatio,
            userSettings.slippage,
            context.proxyAddress,
            context.protocolData.position,
          )

          const gasQty = await txHelpers
            .estimateGas(callOperationExecutor, {
              kind: TxMetaKind.operationExecutor,
              calls: adjustParams.calls as any,
              operationName: 'CustomOperation',
              proxyAddress: context.proxyAddress!,
            })
            .pipe(first())
            .toPromise()

          const estimatedGasPrice = await gasEstimation$(gasQty).pipe(first()).toPromise()

          return { adjustParams, estimatedGasPrice }
        },
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
        getStrategyInfo: (): Observable<ManageAaveEvent> => {
          const collateralToken = 'STETH'
          return combineLatest(
            aaveOracleAssetPriceData$({ token: collateralToken }),
            aaveReserveConfigurationData$({ token: collateralToken }),
          ).pipe(
            map(([oracleAssetPrice, reserveConfigurationData]) => {
              return {
                type: 'UPDATE_STRATEGY_INFO',
                strategyInfo: {
                  oracleAssetPrice,
                  liquidationBonus: reserveConfigurationData.liquidationBonus,
                  collateralToken,
                },
              }
            }),
          )
        },
        getAaveProtocolData: async (context): Promise<AaveProtocolData> => {
          return await aaveProtocolData(context.strategy!, context.proxyAddress!)
            .pipe(first())
            .toPromise()
        },
      }
    }),
  )
}
