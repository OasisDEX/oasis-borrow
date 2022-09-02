import BigNumber from 'bignumber.js'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { assign, sendParent, spawn } from 'xstate'

import { TxMetaKind } from '../../../../../blockchain/calls/txMeta'
import { TransactionStateMachine } from '../../../../stateMachines/transaction'
import { ParametersStateMachine } from '../../open/state'
import { ManageAavePositionData } from '../pipelines/manageAavePosition'
import {
  createManageAaveStateMachine,
  ManageAaveContext,
  ManageAaveEvent,
  ManageAaveStateMachine,
  ManageAaveStateMachineServices,
} from '../state'

function contextToTransactionParameters(context: ManageAaveContext): ManageAavePositionData {
  return {
    kind: TxMetaKind.operationExecutor,
    calls: context.transactionParameters!.calls as any,
    operationName: context.transactionParameters!.operationName,
    token: context.token,
    proxyAddress: context.proxyAddress!,
    amount: context.amount!,
  }
}

export function getManageAaveStateMachine$(
  services: ManageAaveStateMachineServices,
  parametersMachine$: Observable<ParametersStateMachine>,
  transactionStateMachine: TransactionStateMachine<ManageAavePositionData>,
): Observable<ManageAaveStateMachine> {
  return parametersMachine$.pipe(
    map((parametersMachine) => {
      return createManageAaveStateMachine
        .withConfig({
          services: {
            ...services,
          },
          actions: {
            spawnParametersMachine: assign((_) => ({
              refParametersStateMachine: spawn(
                parametersMachine.withConfig({
                  actions: {
                    notifyParent: sendParent(
                      (context): ManageAaveEvent => ({
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
              refParametersStateMachine: spawn(
                parametersMachine.withConfig({
                  actions: {
                    notifyParent: sendParent(
                      (context): ManageAaveEvent => ({
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
          },
        })
        .withContext({
          token: 'ETH',
          multiply: new BigNumber(2),
          inputDelay: 1000,
          amount: new BigNumber(0),
        })
    }),
  )
}
