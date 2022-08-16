import { Observable } from 'rxjs'

import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import {
  createTransactionServices,
  createTransactionStateMachine,
  TransactionStateMachine,
} from '../../../../stateMachines/transaction'
import { manageAavePosition, ManageAavePositionData } from '../pipelines/manageAavePosition'

export function getManageAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
): TransactionStateMachine<ManageAavePositionData> {
  const services = createTransactionServices<ManageAavePositionData>(txHelpers$, context$)
  return createTransactionStateMachine(manageAavePosition).withConfig({
    services: {
      ...services,
    },
  })
}
