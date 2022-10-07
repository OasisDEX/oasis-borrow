import { BigNumber } from 'bignumber.js'
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
  aaveReserveConfigurationData$: ({
    token,
  }: {
    token: string
  }) => Observable<AaveReserveConfigurationData>,
  aaveAssetPriceData$: ({ token }: { token: string }) => Observable<BigNumber>,
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
      const reserveConfigData$ = aaveReserveConfigurationData$({ token: 'STETH' })
      const assetPriceData$ = aaveAssetPriceData$({ token: 'STETH' })
      return combineLatest(reserveConfigData$, assetPriceData$).pipe(
        map(([{ ltv, liquidationThreshold }, assetPrice]) => {
          const minColRatio = new BigNumber(1).div(ltv)
          const maxMultiple = new BigNumber(1).div(minColRatio.minus(1)).plus(1)
          return {
            type: 'UPDATE_STRATEGY_INFO',
            maxMultiple,
            liquidationThreshold,
            assetPrice,
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
    operationName: context.transactionParameters!.operationName,
    token: context.token,
    proxyAddress: context.proxyAddress!,
    amount: context.amount!,
  }
}

export function getOpenAaveStateMachine$(
  services: OpenAaveStateMachineServices,
  parametersMachine$: Observable<ParametersStateMachine>,
  proxyMachine$: Observable<ProxyStateMachine>,
  transactionStateMachine: TransactionStateMachine<OperationExecutorTxMeta>,
  simulationMachine: AaveStEthSimulateStateMachine,
) {
  return combineLatest(parametersMachine$, proxyMachine$).pipe(
    map(([parametersMachine, proxyMachine]) => {
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
                    (context): OpenAaveEvent => ({
                      type: 'TRANSACTION_PARAMETERS_RECEIVED',
                      parameters: context.transactionParameters!,
                      estimatedGasPrice: context.gasPriceEstimation!,
                    }),
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
