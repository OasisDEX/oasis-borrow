import { BigNumber } from 'bignumber.js'
import { AaveConfigurationData } from 'blockchain/calls/aave/aaveLendingPool'
import { combineLatest, Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { assign, sendParent, spawn } from 'xstate'

import { AaveReserveConfigurationData } from '../../../../../blockchain/calls/aave/aaveProtocolDataProvider'
import { OperationExecutorTxMeta } from '../../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { ContextConnected } from '../../../../../blockchain/network'
import { TokenBalances } from '../../../../../blockchain/tokens'
import { TxHelpers } from '../../../../../components/AppContext'
import { ProxyContext, ProxyStateMachine } from '../../../../proxyNew/state'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { createAaveUserConfiguration, hasOtherAssets } from '../../helpers/aaveUserConfiguration'
import {
  AaveStEthSimulateStateMachine,
  createOpenAaveStateMachine,
  OpenAaveContext,
  OpenAaveEvent,
  OpenAaveStateMachineServices,
  ParametersStateMachine,
} from '../state'

export function getOpenAavePositionStateMachineServices(
  context$: Observable<ContextConnected>,
  txHelpers$: Observable<TxHelpers>,
  tokenBalances$: Observable<TokenBalances>,
  proxyAddress$: Observable<string | undefined>,
  aaveOracleAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<AaveReserveConfigurationData>,
  aaveUserConfiguration$: ({
    proxyAddress,
  }: {
    proxyAddress: string
  }) => Observable<AaveConfigurationData>,
  aaveReservesList$: () => Observable<AaveConfigurationData>,
): OpenAaveStateMachineServices {
  return {
    getBalance: (context, _) => {
      return tokenBalances$.pipe(
        map((balances) => balances[context.token!]),
        map(({ balance, price }) => ({
          type: 'SET_BALANCE',
          balance: balance,
          tokenPrice: price,
        })),
      )
    },
    getProxyAddress: () => {
      return proxyAddress$.pipe(
        map((address) => ({
          type: 'PROXY_ADDRESS_RECEIVED',
          proxyAddress: address,
        })),
      )
    },
    getStrategyInfo: () => {
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
    getHasOtherAssets: ({ proxyAddress }) => {
      return combineLatest(
        aaveUserConfiguration$({ proxyAddress: proxyAddress! }),
        aaveReservesList$(),
      ).pipe(
        map(([aaveUserConfiguration, aaveReservesList]) => {
          return {
            type: 'UPDATE_META_INFO',
            hasOtherAssetsThanETH_STETH: hasOtherAssets(
              createAaveUserConfiguration(aaveUserConfiguration, aaveReservesList),
              ['ETH', 'STETH'],
            ),
          }
        }),
      )
    },
  }
}

export function contextToTransactionParameters(context: OpenAaveContext): OperationExecutorTxMeta {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName: 'CustomOperation',
    token: context.token,
    proxyAddress: context.proxyAddress!,
    amount: context.userInput.amount!,
  }
}

export function getOpenAaveStateMachine$(
  services: OpenAaveStateMachineServices,
  parametersMachine$: Observable<ParametersStateMachine>,
  proxyMachine$: Observable<ProxyStateMachine>,
  transactionStateMachine: TransactionStateMachine<OperationExecutorTxMeta>,
  simulationMachine$: Observable<AaveStEthSimulateStateMachine>,
) {
  return combineLatest(parametersMachine$, proxyMachine$, simulationMachine$).pipe(
    map(([parametersMachine, proxyMachine, simulationMachine]) => {
      return createOpenAaveStateMachine.withConfig({
        services: {
          ...services,
        },
        actions: {
          spawnParametersMachine: assign((_) => ({
            refParametersStateMachine: spawn(
              parametersMachine.withConfig({
                actions: {
                  notifyParent: sendParent(
                    (context): OpenAaveEvent => {
                      return {
                        type: 'TRANSACTION_PARAMETERS_RECEIVED',
                        parameters: context.transactionParameters!,
                        estimatedGasPrice: context.gasPriceEstimation!,
                      }
                    },
                  ),
                },
              }),
              { name: 'parametersMachine' },
            ),
          })),
          spawnProxyMachine: assign((_) => ({
            refProxyMachine: spawn(
              proxyMachine.withConfig({
                actions: {
                  raiseSuccess: sendParent(
                    (context: ProxyContext): OpenAaveEvent => ({
                      type: 'PROXY_CREATED',
                      proxyAddress: context.proxyAddress!,
                    }),
                  ),
                },
              }),
              { name: 'proxyMachine' },
            ),
          })),
          spawnTransactionMachine: assign((context) => ({
            refTransactionMachine: spawn(
              transactionStateMachine
                .withConfig({
                  actions: {
                    notifyParent: sendParent(
                      (_): OpenAaveEvent => ({
                        type: 'POSITION_OPENED',
                      }),
                    ),
                  },
                })
                .withContext({
                  ...transactionStateMachine.context,
                  transactionParameters: contextToTransactionParameters(context),
                }),
              {
                name: 'transactionMachine',
              },
            ),
          })),
          spawnSimulationMachine: assign((_) => ({
            refSimulationMachine: spawn(simulationMachine, {
              name: 'simulationMachine',
            }),
          })),
        },
      })
    }),
  )
}
