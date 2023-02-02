import { TransactionDef } from '../../../../blockchain/calls/callsHelpers'
import { OperationExecutorTxMeta } from '../../../../blockchain/calls/operationExecutor'
import { AllowanceStateMachine } from '../../../stateMachines/allowance'
import { DPMAccountStateMachine } from '../../../stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { ProxyStateMachine } from '../../../stateMachines/proxy/state'
import { TransactionStateMachine } from '../../../stateMachines/transaction'
import { TransactionParametersStateMachine } from '../../../stateMachines/transactionParameters'
import { OpenAaveParameters, OpenDepositBorrowParameters } from '../../oasisActionsLibWrapper'
import { createOpenAaveStateMachine, OpenAaveStateMachineServices } from '../state'

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
) {
  return createOpenAaveStateMachine(
    openParametersMachine,
    openDepositBorrowParametersMachine,
    dsProxyMachine,
    dpmProxyMachine,
    allowanceMachine,
    transactionStateMachine,
  ).withConfig({
    services: {
      ...services,
    },
  })
}
