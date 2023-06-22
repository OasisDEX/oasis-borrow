import { CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { Context } from 'blockchain/network'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import { TxHelpers } from 'components/AppContext'
import {
  createDPMAccountStateMachine,
  getDPMAccountStateMachineServices,
} from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { TransactionStateMachine } from 'features/stateMachines/transaction'
import { HasGasEstimation } from 'helpers/form'
import { Observable } from 'rxjs'

export function getDPMAccountStateMachine(
  context$: Observable<Context>,
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  transactionStateMachine: TransactionStateMachine<CreateDPMAccount, UserDpmAccount>,
) {
  const services = getDPMAccountStateMachineServices(context$, txHelpers$, gasEstimation$)

  return createDPMAccountStateMachine(transactionStateMachine).withConfig({
    services: {
      ...services,
    },
  })
}
