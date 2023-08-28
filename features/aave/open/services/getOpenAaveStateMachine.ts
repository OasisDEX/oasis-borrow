import { OpenAaveParameters } from 'actions/aave-like/types'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { createOpenAaveStateMachine, OpenAaveStateMachineServices } from 'features/aave/open/state'
import {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import { AllowanceStateMachine } from 'features/stateMachines/allowance'
import { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import { ProxyStateMachine } from 'features/stateMachines/proxy'
import { TransactionStateMachine } from 'features/stateMachines/transaction'
import { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import { AutomationTxData } from 'helpers/context/types'

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  openMultiplyParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  dsProxyMachine: ProxyStateMachine,
  dpmProxyMachine: DPMAccountStateMachine,
  allowanceMachine: AllowanceStateMachine,
  transactionStateMachine: (
    transactionParameters: OperationExecutorTxMeta,
    transactionDef: TransactionDef<OperationExecutorTxMeta>,
  ) => TransactionStateMachine<OperationExecutorTxMeta>,
  stopLossStateMachine: (
    txData: AutomationAddTriggerData,
    addTriggerDef: AutomationAddTriggerTxDef,
  ) => TransactionStateMachine<AutomationTxData>,
) {
  return createOpenAaveStateMachine(
    openMultiplyParametersMachine,
    dsProxyMachine,
    dpmProxyMachine,
    allowanceMachine,
    transactionStateMachine,
    stopLossStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
