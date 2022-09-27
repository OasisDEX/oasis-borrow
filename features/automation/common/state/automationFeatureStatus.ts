import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'

interface GetAutomationFeatureStatusParams {
  context: Context
  currentForm: AutomationFormType
  feature: AutomationFeatures
  triggersId: BigNumber[]
  txStatus?: TxStatus
  vaultController?: string
}

interface AutomationFeatureStatus {
  isAddForm: boolean
  isFailureStage: boolean
  isFirstSetup: boolean
  isOwner: boolean
  isProgressStage: boolean
  isRemoveForm: boolean
  isSuccessStage: boolean
  stage: SidebarAutomationStages
}

export function getAutomationFeatureStatus({
  context,
  currentForm,
  feature,
  triggersId,
  txStatus,
  vaultController,
}: GetAutomationFeatureStatusParams): AutomationFeatureStatus {
  const isOwner = context.status === 'connected' && context.account === vaultController
  const isAddForm = currentForm === 'add'
  const isRemoveForm = currentForm === 'remove'
  const isSuccessStage = txStatus === TxStatus.Success
  const isFailureStage = (txStatus && failedStatuses.includes(txStatus)) || false
  const isProgressStage = (txStatus && progressStatuses.includes(txStatus)) || false
  const stage = isSuccessStage
    ? 'txSuccess'
    : isProgressStage
    ? 'txInProgress'
    : isFailureStage
    ? 'txFailure'
    : feature !== AutomationFeatures.STOP_LOSS
    ? 'editing'
    : 'stopLossEditing'
  const isFirstSetup = triggersId.every((id) => id.isZero())

  return {
    isAddForm,
    isFailureStage,
    isFirstSetup,
    isOwner,
    isProgressStage,
    isRemoveForm,
    isSuccessStage,
    stage,
  }
}
