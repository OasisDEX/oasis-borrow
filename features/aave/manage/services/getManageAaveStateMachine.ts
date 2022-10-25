import { OPERATION_NAMES } from '@oasisdex/oasis-actions'
import { isEqual } from 'lodash'
import { combineLatest, Observable } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/internal/operators'
import { map } from 'rxjs/operators'
import { assign, sendParent, spawn } from 'xstate'

import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { TxMetaKind } from '../../../../blockchain/calls/txMeta'
import { Tickers } from '../../../../blockchain/prices'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { UserSettingsState } from '../../../userSettings/userSettings'
import { getPricesFeed$ } from '../../common/services/getPricesFeed'
import { EMPTY_POSITION } from '../../oasisActionsLibWrapper'
import { OpenAaveEvent } from '../../open/state'
import {
  ClosePositionParametersStateMachine,
  createManageAaveStateMachine,
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
  OperationType,
} from '../state'

function contextToTransactionParameters(context: ManageAaveContext): OperationExecutorTxMeta {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName:
      context.operationType === OperationType.CLOSE_POSITION
        ? OPERATION_NAMES.aave.CLOSE_POSITION
        : 'CustomOperation',
    token: context.token,
    proxyAddress: context.proxyAddress!,
  }
}

export function getManageAaveStateMachine$(
  services$: Observable<ManageAaveStateMachineServices>,
  closePositionParametersStateMachine$: Observable<ClosePositionParametersStateMachine>,
  transactionStateMachine: TransactionStateMachine<OperationExecutorTxMeta>,
  userSettings$: Observable<UserSettingsState>,
  prices$: (tokens: string[]) => Observable<Tickers>,
  { token, address, strategy }: { token: string; address: string; strategy: string },
): Observable<ManageAaveStateMachine> {
  const pricesFeed$ = getPricesFeed$(prices$)
  return combineLatest(closePositionParametersStateMachine$, services$, userSettings$).pipe(
    map(([closePositionParametersStateMachine, services, userSettings]) => {
      return createManageAaveStateMachine
        .withConfig({
          services: {
            ...services,
          },
          actions: {
            spawnPricesObservable: assign((context) => {
              return {
                refPriceObservable: spawn(pricesFeed$(context.collateralToken), 'pricesFeed'),
              }
            }),
            spawnUserSettingsObservable: assign((_) => {
              const settings$: Observable<OpenAaveEvent> = userSettings$.pipe(
                distinctUntilChanged(isEqual),
                map((settings) => ({ type: 'USER_SETTINGS_CHANGED', userSettings: settings })),
              )
              return {
                refUserSettingsObservable: spawn(settings$, 'userSettings'),
              }
            }),
            spawnClosePositionParametersMachine: assign((context) => ({
              refClosePositionParametersStateMachine: spawn(
                closePositionParametersStateMachine
                  .withConfig({
                    actions: {
                      notifyParent: sendParent(
                        (context): ManageAaveEvent => {
                          return {
                            type: 'CLOSING_PARAMETERS_RECEIVED',
                            parameters: context.transactionParameters!,
                            estimatedGasPrice: context.gasPriceEstimation!,
                          }
                        },
                      ),
                    },
                  })
                  .withContext({
                    ...closePositionParametersStateMachine.context,
                    proxyAddress: context.proxyAddress!,
                    token: context.strategy!,
                    position: context.protocolData!.position,
                  }),
                { name: 'parametersMachine' },
              ),
            })),
            spawnTransactionMachine: assign((context) => ({
              refTransactionStateMachine: spawn(
                transactionStateMachine
                  .withConfig({
                    actions: {
                      notifyParent: sendParent(
                        (_): ManageAaveEvent => ({
                          type: 'POSITION_CLOSED',
                        }),
                      ),
                      raiseError: sendParent(
                        (context): ManageAaveEvent => ({
                          type: 'TRANSACTION_FAILED',
                          error: context.txError,
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
          },
        })
        .withContext({
          currentStep: 1,
          totalSteps: 2,
          token,
          userInput: {},
          inputDelay: 1000,
          address,
          strategy,
          collateralToken: 'STETH',
          slippage: userSettings.slippage,
          currentPosition: EMPTY_POSITION,
          loading: false,
        })
    }),
  )
}
