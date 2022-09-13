import { TxStatus } from '@oasisdex/transactions'
import BigNumber from 'bignumber.js'
import { Context } from 'blockchain/network'
import { Vault } from 'blockchain/vaults'
import { failedStatuses, progressStatuses } from 'features/automation/common/consts'
import { AutomationFormType } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures, SidebarAutomationStages } from 'features/automation/common/types'

interface GetAutomationFeatureStatusParams {
  context: Context
  currentForm: AutomationFormType
  feature: AutomationFeatures
  txStatus?: TxStatus
  vault: Vault
  triggersId: BigNumber[]
}

interface AutomationFeatureStatus {
  isAddForm: boolean
  isFailureStage: boolean
  isOwner: boolean
  isProgressStage: boolean
  isRemoveForm: boolean
  isSuccessStage: boolean
  isFirstSetup: boolean
  stage: SidebarAutomationStages
}

export function getAutomationFeatureStatus({
  currentForm,
  context,
  txStatus,
  vault,
  feature,
  triggersId,
}: GetAutomationFeatureStatusParams): AutomationFeatureStatus {
  const isOwner = context.status === 'connected' && context.account === vault.controller
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
  const isFirstSetup = triggersId.every(id => id.isZero())

  return {
    isAddForm,
    isFailureStage,
    isOwner,
    isProgressStage,
    isRemoveForm,
    isSuccessStage,
    stage,
    isFirstSetup,
  }
}
