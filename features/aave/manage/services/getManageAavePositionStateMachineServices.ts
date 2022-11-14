import { IStrategy } from '@oasisdex/oasis-actions'
import { BigNumber } from 'bignumber.js'
import { combineLatest, from, Observable, of } from 'rxjs'
import { filter, first, flatMap, map, startWith, switchMap } from 'rxjs/operators'

import { AaveReserveConfigurationData } from '../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { callOperationExecutor } from '../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../blockchain/network'
import { TokenBalances } from '../../../../blockchain/tokens'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { UserSettingsState } from '../../../userSettings/userSettings'
import { getAdjustAaveParameters } from '../../oasisActionsLibWrapper'
import { AaveProtocolData, ManageAaveEvent, ManageAaveStateMachineServices } from '../state'

export function getManageAavePositionStateMachineServices$(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  userSettings$: Observable<UserSettingsState>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveOracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<AaveReserveConfigurationData>,
  aaveProtocolData$: (token: string, proxyAddress: string) => Observable<AaveProtocolData>,
): Observable<ManageAaveStateMachineServices> {
  return combineLatest(context$, userSettings$, txHelpers$).pipe(
    map(([contextConnected, userSettings, txHelpers]) => {
      return {
        getParameters: (
          context,
        ): Observable<{
          type: string
          adjustParams: IStrategy | undefined
          estimatedGasPrice: HasGasEstimation | undefined
        }> => {
          if (!context.proxyAddress || !context.protocolData || !context.userInput.riskRatio) {
            return of({
              type: 'PARAMETERS_RECEIVED',
              adjustParams: undefined,
              estimatedGasPrice: undefined,
            })
          }

          return from(
            // get position simulation params and calldata to adjust
            getAdjustAaveParameters(
              contextConnected,
              context.userInput.amount,
              context.userInput.riskRatio,
              userSettings.slippage,
              context.proxyAddress,
              context.protocolData.position,
            ),
          ).pipe(
            flatMap((adjustParams) => {
              // do gas estimation separately
              return from(
                txHelpers.estimateGas(callOperationExecutor, {
                  kind: TxMetaKind.operationExecutor,
                  calls: adjustParams.calls as any,
                  operationName: 'CustomOperation',
                  proxyAddress: context.proxyAddress!,
                }),
              ).pipe(
                switchMap((gasQty) => gasEstimation$(gasQty)),
                map((estimatedGasPrice) => {
                  return {
                    type: 'PARAMETERS_RECEIVED',
                    adjustParams,
                    estimatedGasPrice,
                  }
                }),
                // pass through position call data before gas estimation
                startWith({
                  adjustParams,
                  estimatedGasPrice: undefined,
                  type: 'PARAMETERS_RECEIVED',
                }),
              )
            }),
          )
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
        getStrategyInfo: (context): Observable<ManageAaveEvent> => {
          return combineLatest(
            aaveOracleAssetPriceData$({ token: context.collateralToken }),
            aaveReserveConfigurationData$({ token: context.collateralToken }),
          ).pipe(
            map(([oracleAssetPrice, reserveConfigurationData]) => {
              return {
                type: 'UPDATE_STRATEGY_INFO',
                strategyInfo: {
                  oracleAssetPrice,
                  liquidationBonus: reserveConfigurationData.liquidationBonus,
                  collateralToken: context.collateralToken,
                },
              }
            }),
          )
        },
        aaveProtocolDataObservable: (context) => {
          return proxyAddress$.pipe(
            filter((proxyAddress) => proxyAddress !== undefined),
            switchMap((proxyAddress) => aaveProtocolData$(context.collateralToken, proxyAddress!)),
            map((data) => {
              return { type: 'AAVE_POSITION_DATA_RECEIVED', data }
            }),
          )
        },
      }
    }),
  )
}
