import type { OpenAaveParameters } from 'actions/aave-like/types'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import type { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import type { OpenAaveStateMachineServices } from 'features/aave/open/state'
import { createOpenAaveStateMachine } from 'features/aave/open/state'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from 'features/automation/common/txDefinitions.types'
import type { AllowanceStateMachine } from 'features/stateMachines/allowance'
import type { DPMAccountStateMachine } from 'features/stateMachines/dpmAccount'
import type { ProxyStateMachine } from 'features/stateMachines/proxy'
import type { TransactionStateMachine } from 'features/stateMachines/transaction'
import type { TransactionParametersStateMachine } from 'features/stateMachines/transactionParameters'
import type { AutomationTxData } from 'helpers/context/types'

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
