import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
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
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions'
import { AutomationPublishType } from 'features/automation/common/types'
import { addTransactionMap } from 'helpers/gasEstimate'
import { zero } from 'helpers/zero'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

export const takeUntilTxState = [
  TxStatus.Success,
  TxStatus.Failure,
  TxStatus.Error,
  TxStatus.CancelledByTheUser,
]

function handleTriggerTx({
  txState,
  ethPrice,
  uiChanges,
  publishType,
}: {
  txState: TxState<TxMeta>
  ethPrice: BigNumber
  uiChanges: UIChanges
  publishType: AutomationPublishType
}) {
  const gasUsed =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed) : zero

  const effectiveGasPrice =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.effectiveGasPrice) : zero

  const totalCost =
    !gasUsed.eq(zero) && !effectiveGasPrice.eq(zero)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
      : zero

  uiChanges.publish(publishType, {
    type: 'tx-details',
    txDetails: {
      txHash: (txState as any).txHash,
      txStatus: txState.status,
      txError: txState.status === TxStatus.Error ? txState.error : undefined,
      txCost: totalCost,
    },
  })
}

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
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, publishType }))
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
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, publishType }))
}
