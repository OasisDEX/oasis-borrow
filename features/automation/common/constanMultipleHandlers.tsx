import { TxMeta, TxState, TxStatus } from "@oasisdex/transactions";
import { amountFromWei } from "@oasisdex/utils";
import BigNumber from "bignumber.js";
import { AutomationBotAddTriggerData } from "blockchain/calls/automationBot";
import { addAutomationBotAggregatorTrigger } from "blockchain/calls/automationBotAggregator";
import { TxHelpers, UIChanges } from "components/AppContext";
import { zero } from "helpers/zero";
import { takeWhileInclusive } from "rxjs-take-while-inclusive";
import { CONSTANT_MULTIPLE_FORM_CHANGE } from "../protection/common/UITypes/constantMultipleFormChange";
// DummyAutomationBotAggregator

const takeUntilTxState = [
  TxStatus.Success,
  TxStatus.Failure,
  TxStatus.Error,
  TxStatus.CancelledByTheUser,
]

export function addConstantMultipleTrigger(
    { sendWithGasEstimation }: TxHelpers,
    txData: AutomationBotAddTriggerData,
    uiChanges: UIChanges,
    ethPrice: BigNumber,
    ) {
    const formChanged= 'CONSTANT_MULTIPLE_FORM_CHANGE'
    sendWithGasEstimation(addAutomationBotAggregatorTrigger, txData)
      .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
      .subscribe((txState) => handleTriggerTx({ txState, ethPrice, uiChanges }))
  }

  function handleTriggerTx({
    txState,
    ethPrice,
    uiChanges,
    // formChanged,
  }: {
    txState: TxState<TxMeta>
    ethPrice: BigNumber
    uiChanges: UIChanges
    // formChanged: CONSTANT_MU
  }) {
    const gasUsed =
      txState.status === TxStatus.Success ? new BigNumber(txState.receipt.gasUsed) : zero
  
    const effectiveGasPrice =
      txState.status === TxStatus.Success ? new BigNumber(txState.receipt.effectiveGasPrice) : zero
  
    const totalCost =
      !gasUsed.eq(0) && !effectiveGasPrice.eq(0)
        ? amountFromWei(gasUsed.multipliedBy(effectiveGasPrice)).multipliedBy(ethPrice)
        : zero
  
    uiChanges.publish(CONSTANT_MULTIPLE_FORM_CHANGE, {
      type: 'tx-details',
      txDetails: {
        txHash: (txState as any).txHash,
        txStatus: txState.status,
        txError: txState.status === TxStatus.Error ? txState.error : undefined,
        txCost: totalCost,
      },
    })
  }
  