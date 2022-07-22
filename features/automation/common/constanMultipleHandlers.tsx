import { TxHelpers } from "components/AppContext";
// DummyAutomationBotAggregator
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