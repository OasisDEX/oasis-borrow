import { AjnaFlow, AjnaSidebarEditingStep, AjnaSidebarStep } from 'features/ajna/common/types'

export function getAjnaSidebarButtonsStatus({
  ajnaSafetySwitchOn,
  currentStep,
  editingStep,
  flow,
  hasErrors,
  isFormFrozen,
  isAllowanceLoading,
  isFormValid,
  isOwner,
  isSimulationLoading,
  isTransitionInProgress,
  isTransitionWaitingForApproval,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  walletAddress,
}: {
  ajnaSafetySwitchOn: boolean
  currentStep: AjnaSidebarStep
  editingStep: AjnaSidebarEditingStep
  flow: AjnaFlow
  hasErrors: boolean
  isAllowanceLoading: boolean
  isFormFrozen: boolean
  isFormValid: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTransitionInProgress: boolean
  isTransitionWaitingForApproval: boolean
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
      isFormFrozen ||
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

  const isPrimaryButtonHidden =
    !!(walletAddress && !isOwner && currentStep === editingStep) ||
    (ajnaSafetySwitchOn && flow === 'open' && currentStep !== 'risk')
  const isTextButtonHidden =
    !(
      (currentStep === 'transaction' && (!isTxStarted || isTxError)) ||
      (isTransitionWaitingForApproval && !isTransitionInProgress)
    ) && currentStep !== 'nft'

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
