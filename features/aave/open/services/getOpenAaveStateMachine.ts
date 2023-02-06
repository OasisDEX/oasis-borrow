import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { DPMAccountStateMachine } from '../../../stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { ProxyStateMachine } from '../../../stateMachines/proxy/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { OpenAaveParameters } from '../../oasisActionsLibWrapper'
import { createOpenAaveStateMachine, OpenAaveStateMachineServices } from '../state'
import {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
} from '../../../automation/common/txDefinitions'
import { AutomationTxData } from '../../../../components/AppContext'

export function getOpenAaveStateMachine(
  services: OpenAaveStateMachineServices,
  transactionParametersMachine: TransactionParametersStateMachine<OpenAaveParameters>,
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
    transactionParametersMachine,
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
