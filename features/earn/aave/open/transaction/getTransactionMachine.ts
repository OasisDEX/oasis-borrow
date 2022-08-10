import { Observable } from 'rxjs'

import { ContextConnected } from '../../../../../blockchain/network'
import { TxHelpers } from '../../../../../components/AppContext'
import {
  createTransactionServices,
  createTransactionStateMachine,
  TransactionStateMachine,
} from '../../../../stateMachines/transaction'
import { openAavePosition, OpenAavePositionData } from '../pipelines/openAavePosition'

export function getOpenAaveTransactionMachine(
  txHelpers$: Observable<TxHelpers>,
  context$: Observable<ContextConnected>,
): TransactionStateMachine<OpenAavePositionData> {
  const services = createTransactionServices<OpenAavePositionData>(txHelpers$, context$)
  return createTransactionStateMachine(openAavePosition).withConfig({
    services: {
      ...services,
    },
  })
}
