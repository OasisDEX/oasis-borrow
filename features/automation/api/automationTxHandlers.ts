import type BigNumber from 'bignumber.js'
import type {
  AutomationBotAddTriggerData,
  AutomationBotV2AddTriggerData,
} from 'blockchain/calls/automationBot.types'
import { removeAutomationBotAggregatorTriggers } from 'blockchain/calls/automationBotAggregator.constants'
import type { AutomationBotAddAggregatorTriggerData } from 'blockchain/calls/automationBotAggregator.types'
import type { TransactionDef } from 'blockchain/calls/callsHelpers'
import { addTransactionMap } from 'features/automation/common/txDefinitions'
import type {
  AutomationAddTriggerData,
  AutomationAddTriggerTxDef,
  AutomationRemoveTriggerData,
  AutomationRemoveTriggerTxDef,
} from 'features/automation/common/txDefinitions.types'
import type { AutomationPublishType } from 'features/automation/common/types'
import type { TxHelpers } from 'helpers/context/TxHelpers'
import type { AutomationTxData } from 'helpers/context/types'
import { handleTransaction } from 'helpers/handleTransaction'
import type { UIChanges } from 'helpers/uiChanges.types'
import { takeWhileInclusive } from 'rxjs-take-while-inclusive'

import { takeUntilTxState } from './takeUntilTxState'

export function removeAutomationTrigger(
  { send }: TxHelpers,
  txData: AutomationRemoveTriggerData,
  uiChanges: UIChanges,
  ethPrice: BigNumber,
  publishType: AutomationPublishType,
  removeTriggerDef?: AutomationRemoveTriggerTxDef,
) {
  const resolvedTxDef = removeTriggerDef || removeAutomationBotAggregatorTriggers

  send(resolvedTxDef as TransactionDef<AutomationTxData>, txData)
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
  { send }: TxHelpers,
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

  send(resolvedTxDef as TransactionDef<AutomationTxData>, txData)
    .pipe(takeWhileInclusive((txState) => !takeUntilTxState.includes(txState.status)))
    .subscribe((txState) => {
      return handleTransaction({
        txState,
        ethPrice,
        setTxDetails: (txDetails) =>
          uiChanges.publish(publishType, { type: 'tx-details', txDetails }),
      })
    })
}
