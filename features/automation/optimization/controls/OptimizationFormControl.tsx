import { TriggerType } from '@oasisdex/automation'
import { TxStatus } from '@oasisdex/transactions'
import { Vault } from 'blockchain/vaults'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import {
  SidebarSetupAutoBuy,
  SidebarSetupAutoBuyProps,
} from 'features/automation/optimization/sidebars/SidebarSetupAutoBuy'
import {
  failedStatuses,
  progressStatuses,
} from 'features/automation/protection/common/consts/txStatues'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'
import { useUIChanges } from 'helpers/uiChangesHook'
import React, { useState } from 'react'

interface OptimizationFormControlProps {
  automationTriggersData: TriggersData
  vault: Vault
}

export function OptimizationFormControl({
  automationTriggersData,
  vault,
}: OptimizationFormControlProps) {
  const basicBuyTriggerData = extractBasicBSData(automationTriggersData, TriggerType.BasicBuy)

  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  const txStatus = uiState?.txDetails?.txStatus

  const isFailureStage = txStatus && failedStatuses.includes(txStatus)
  const isProgressStage = txStatus && progressStatuses.includes(txStatus)
  const isSuccessStage = txStatus === TxStatus.Success

  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : 'stopLossEditing'

  const { isTriggerEnabled } = basicBuyTriggerData
  const [firstSetup, setFirstSetup] = useState(!isTriggerEnabled)

  const isProgressDisabled = !!(
    // !isOwner ||
    // (!isEditing && txStatus !== TxStatus.Success) ||
    isProgressStage
  )

  const props: SidebarSetupAutoBuyProps = {
    isAutoBuyOn: basicBuyTriggerData.isTriggerEnabled,
    vault,
    isProgressDisabled,
    execCollRatio: uiState.execCollRatio,
    targetCollRatio: uiState.targetCollRatio,
    withThreshold: uiState.withThreshold,
    maxBuyOrMinSellPrice: uiState.maxBuyOrMinSellPrice,
    continuous: uiState.continuous,
    deviation: uiState.deviation,
    replacedTriggerId: uiState.triggerId,
    stage,
    firstSetup,
  }

  return <SidebarSetupAutoBuy {...props} />
}
