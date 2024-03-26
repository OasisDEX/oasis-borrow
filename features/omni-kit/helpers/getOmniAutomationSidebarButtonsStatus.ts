import type {
  OmniSidebarAutomationEditingStep,
  OmniSidebarAutomationStep,
  OmniSidebarEditingStep,
} from 'features/omni-kit/types'
import { OmniSidebarStep } from 'features/omni-kit/types'

interface GetOmniAutomationSidebarButtonsStatusParams {
  currentStep: OmniSidebarStep | OmniSidebarAutomationStep
  editingStep: OmniSidebarEditingStep | OmniSidebarAutomationEditingStep
  hasErrors: boolean
  isFormFrozen: boolean
  isFormValid: boolean
  isOpening: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  safetySwitch: boolean
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getOmniAutomationSidebarButtonsStatus({
  currentStep,
  editingStep,
  hasErrors,
  isFormFrozen,
  isFormValid,
  isOpening,
  isOwner,
  isSimulationLoading,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  safetySwitch,
  shouldSwitchNetwork,
  walletAddress,
}: GetOmniAutomationSidebarButtonsStatusParams) {
  const isPrimaryButtonDisabled =
    !!walletAddress &&
    !shouldSwitchNetwork &&
    (!isFormValid ||
      hasErrors ||
      isFormFrozen ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval)

  const isPrimaryButtonLoading =
    !!walletAddress &&
    !shouldSwitchNetwork &&
    (isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isPrimaryButtonHidden =
    !!(walletAddress && !isOwner && currentStep === editingStep) ||
    (safetySwitch && isOpening && currentStep !== OmniSidebarStep.Risk) ||
    (safetySwitch && !isOpening && currentStep !== OmniSidebarStep.Risk)
  const isTextButtonHidden = !(
    currentStep === OmniSidebarStep.Transaction &&
    (!isTxStarted || isTxError)
  )

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
