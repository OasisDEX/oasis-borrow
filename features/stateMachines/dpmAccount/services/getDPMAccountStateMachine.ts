import { Observable } from 'rxjs'

import { CreateDPMAccount } from '../../../../blockchain/calls/accountFactory'
import { UserDpmAccount } from '../../../../blockchain/userDpmProxies'
import { TxHelpers } from '../../../../components/AppContext'
import { HasGasEstimation } from '../../../../helpers/form'
import { TransactionStateMachine } from '../../transaction'
import {
  createDPMAccountStateMachine,
  getDPMAccountStateMachineServices,
} from '../state/createDPMAccountStateMachine'

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
