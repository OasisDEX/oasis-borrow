import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
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
  txData: AutomationBotRemoveTriggersData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
) {
  sendWithGasEstimation(removeAutomationBotAggregatorTriggers, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, publishType }))
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
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, publishType }))
}
