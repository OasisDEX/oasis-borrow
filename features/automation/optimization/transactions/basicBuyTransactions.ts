import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import {
  addAutomationBotTrigger,
  AutomationBotAddTriggerData,
} from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { TxHelpers } from 'components/AppContext'
import { prepareAddBasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { AddBasicBuyChange } from 'features/shared/transactions'
import { transactionToX } from 'helpers/form'
import { zero } from 'helpers/zero'
import { of } from 'rxjs'

export function addBasicBuyTrigger<C extends AddBasicBuyChange>(
  { sendWithGasEstimation }: TxHelpers,
  change: (ch: C) => void,
  uiState: BasicBSFormChange,
  vault: Vault,
) {
  sendWithGasEstimation(
    addAutomationBotTrigger,
    prepareAddBasicBSTriggerData({
      vaultData: vault,
      triggerType: TriggerType.BasicBuy,
      execCollRatio: uiState.execCollRatio,
      targetCollRatio: uiState.targetCollRatio,
      maxBuyOrMinSellPrice: uiState.withThreshold ? uiState.maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
      continuous: uiState.continuous, // leave as default
      deviation: uiState.deviation,
      replacedTriggerId: uiState.triggerId,
    }),
  )
    .pipe(
      transactionToX<AddBasicBuyChange, AutomationBotAddTriggerData>(
        { kind: 'basicBuyTxWaitingForApproval' },
        (txState) =>
          of({ kind: 'basicBuyTxInProgress', basicBuyTxHash: (txState as any).txHash as string }),
        (txState) =>
          of({
            kind: 'basicBuyTxFailure',
            txError:
              txState.status === TxStatus.Error || txState.status === TxStatus.CancelledByTheUser
                ? txState.error
                : undefined,
          }),
        () => {
          return of({
            kind: 'basicBuyTxSuccess',
          })
        },
      ),
    )
    .subscribe((ch) => change(ch as C))
}
