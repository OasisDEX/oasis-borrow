import { CreateDPMAccount } from 'blockchain/calls/accountFactory'
import { Context } from 'blockchain/network'
import { UserDpmAccount } from 'blockchain/userDpmProxies'
import {
  createDPMAccountStateMachine,
  getDPMAccountStateMachineServices,
} from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import { TransactionStateMachine } from 'features/stateMachines/transaction'
import { TxHelpers } from 'helpers/context/types'
import { HasGasEstimation } from 'helpers/context/types'
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
