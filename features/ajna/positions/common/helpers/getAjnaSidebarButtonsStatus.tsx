import { AjnaSidebarEditingStep, AjnaSidebarStep } from 'features/ajna/common/types'

export function getAjnaSidebarButtonsStatus({
  currentStep,
  editingStep,
  hasErrors,
  isAllowanceLoading,
  isFormValid,
  isOwner,
  isSimulationLoading,
  isTransitionInProgress,
  isTransitionWairingForApproval,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  walletAddress,
}: {
  currentStep: AjnaSidebarStep
  editingStep: AjnaSidebarEditingStep
  hasErrors: boolean
  isAllowanceLoading: boolean
  isFormValid: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTransitionInProgress: boolean
  isTransitionWairingForApproval: boolean
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  walletAddress?: string
}) {
  const isPrimaryButtonDisabled =
    !!walletAddress &&
    (!isFormValid ||
      hasErrors ||
      isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval ||
      isTransitionInProgress)

  const isPrimaryButtonLoading =
    !!walletAddress &&
    (isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval ||
      isTransitionInProgress)

  const isPrimaryButtonHidden = !!(walletAddress && !isOwner && currentStep === editingStep)
  const isTextButtonHidden = !(
    (currentStep === 'transaction' && (!isTxStarted || isTxError)) ||
    (isTransitionWairingForApproval && !isTransitionInProgress)
  )

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
