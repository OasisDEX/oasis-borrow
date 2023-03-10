import { CreateDPMAccount } from 'blockchain/calls/accountFactory'
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
  txHelpers$: Observable<TxHelpers>,
  gasEstimation$: (gas: number) => Observable<HasGasEstimation>,
  transactionStateMachine: TransactionStateMachine<CreateDPMAccount, UserDpmAccount>,
) {
  const services = getDPMAccountStateMachineServices(txHelpers$, gasEstimation$)

  return createDPMAccountStateMachine(transactionStateMachine).withConfig({
    services: {
      ...services,
    },
  })
}
