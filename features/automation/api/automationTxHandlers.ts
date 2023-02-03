import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { AutomationBotAddTriggerData } from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  AutomationBotRemoveTriggersData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { TxHelpers, UIChanges } from 'components/AppContext'
import { AutomationPublishType } from 'features/automation/common/types'
import { addTransactionMap } from 'helpers/gasEstimate'
import { handleTransaction } from 'helpers/handleTransaction'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export const takeUntilTxState = [
  TxStatus.Success,
  TxStatus.Failure,
  TxStatus.Error,
  TxStatus.CancelledByTheUser,
]

export function removeAutomationTrigger(
  { sendWithGasEstimation }: TxHelpers,
  txData: AutomationBotRemoveTriggersData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
) {
  sendWithGasEstimation(removeAutomationBotAggregatorTriggers, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) =>
      handleTransaction({
        txState,
        ethPrice,
        setTxDetails: (txDetails) =>
          uiChanges.publish(publishType, { type: 'tx-details', txDetails }),
      }),
    )
}

export function addAutomationTrigger(
  { sendWithGasEstimation }: TxHelpers,
  txData: AutomationBotAddAggregatorTriggerData | AutomationBotAddTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
) {
  const txDef = addTransactionMap[publishType] as TransactionDef<
    AutomationBotAddTriggerData | AutomationBotAddAggregatorTriggerData
  >

  sendWithGasEstimation(txDef, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) =>
      handleTransaction({
        txState,
        ethPrice,
        setTxDetails: (txDetails) =>
          uiChanges.publish(publishType, { type: 'tx-details', txDetails }),
      }),
    )
}
