import { OpenAaveParameters } from 'actions/aave'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from 'blockchain/calls/operationExecutor'
import { AutomationTxData } from 'components/AppContext'
import {
  OpenAaveParameters,
  OpenDepositBorrowParameters,
} from 'features/aave/oasisActionsLibWrapper'
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

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  openParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
  openDepositBorrowParametersMachine: TransactionParametersStateMachine<
    OpenDepositBorrowParameters
  >,
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
    openParametersMachine,
    openDepositBorrowParametersMachine,
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
