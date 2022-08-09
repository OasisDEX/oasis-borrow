import { TxMeta, TxState, TxStatus } from '@oasisdex/transactions'
import { amountFromWei } from '@oasisdex/utils'
import BigNumber from 'bignumber.js'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
  AutomationBotRemoveTriggerData,
  removeAutomationBotTrigger,
} from 'blockchain/calls/automationBot'
import { TxHelpers, UIChanges } from 'components/AppContext'
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
  formChanged,
}: {
  txState: TxState<TxMeta>
  ethPrice: BigNumber
  uiChanges: UIChanges
  formChanged: 'BASIC_BUY_FORM_CHANGE' | 'BASIC_SELL_FORM_CHANGE'
}) {
  const gasUsed =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed) : zero

  const effectiveGasPrice =
    txState.status === TxStatus.Success ? new BigNumber(txState.receipt.effectiveGasPrice) : zero

  const totalCost =
    !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
      ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
      : zero

  uiChanges.publish(formChanged, {
    type: 'tx-details',
    txDetails: {
      txHash: (txState as any).txHash,
      txStatus: txState.status,
      txError: txState.status === TxStatus.Error ? txState.error : undefined,
      txCost: totalCost,
    },
  })
}

export function addBasicBSTrigger(
  { sendWithGasEstimation }: TxHelpers,
  txData: AutomationBotAddTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  formChanged: 'BASIC_BUY_FORM_CHANGE' | 'BASIC_SELL_FORM_CHANGE',
) {
  sendWithGasEstimation(addAutomationBotTrigger, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, formChanged }))
}

export function removeBasicBSTrigger(
  { sendWithGasEstimation }: TxHelpers,
  txData: AutomationBotRemoveTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  formChanged: 'BASIC_BUY_FORM_CHANGE' | 'BASIC_SELL_FORM_CHANGE',
) {
  sendWithGasEstimation(removeAutomationBotTrigger, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges, formChanged }))
}
