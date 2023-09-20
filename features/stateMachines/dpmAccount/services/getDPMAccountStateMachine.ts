import type { CreateDPMAccount } from 'blockchain/calls/accountFactory.types'
import type { Context } from 'blockchain/network'
import type { UserDpmAccount } from 'blockchain/userDpmProxies'
import {
  createDPMAccountStateMachine,
  getDPMAccountStateMachineServices,
} from 'features/stateMachines/dpmAccount/state/createDPMAccountStateMachine'
import type { TransactionStateMachine } from 'features/stateMachines/transaction'
import type { TxHelpers } from 'helpers/context/types'
import type { HasGasEstimation } from 'helpers/types/HasGasEstimation'
import type { Observable } from 'rxjs'

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
