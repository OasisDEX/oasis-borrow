import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
} from 'blockchain/calls/automationBot'
import {
  AutomationBotAddAggregatorTriggerData,
  removeAutomationBotAggregatorTriggers,
} from 'blockchain/calls/automationBotAggregator'
import { TransactionDef } from 'blockchain/calls/callsHelpers'
import { AutomationTxData, TxHelpers, UIChanges } from 'components/AppContext'
import {
  addTransactionMap,
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import { AutomationPublishType } from 'features/automation/common/types'
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
  txData: AutomationRemoveTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
  removeTriggerDef?: AutomationRemoveTriggerTxDef,
) {
  const resolvedTxDef = removeTriggerDef || removeAutomationBotAggregatorTriggers

  sendWithGasEstimation(resolvedTxDef as TransactionDef<AutomationTxData>, txData)
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
  txData: AutomationAddTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
  addTriggerDef?: AutomationAddTriggerTxDef,
) {
  const txDef = addTransactionMap[publishType] as TransactionDef<
    | AutomationBotAddTriggerData
    | AutomationBotAddAggregatorTriggerData
    | AutomationBotV2AddTriggerData
  >

  const resolvedTxDef = addTriggerDef || txDef

  sendWithGasEstimation(resolvedTxDef as TransactionDef<AutomationTxData>, txData)
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
