import type {
  OmniFormAction,
  OmniSidebarEditingStep,
  OmniSidebarStep,
} from 'features/omni-kit/types'

export function getOmniSidebarButtonsStatus({
  action,
  currentStep,
  editingStep,
  hasErrors,
  isAllowanceLoading,
  isFormFrozen,
  isFormValid,
  isOpening,
  isOwner,
  isSimulationLoading,
  isTransitionInProgress,
  isTransitionWaitingForApproval,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  safetySwitch,
  walletAddress,
}: {
  action?: OmniFormAction
  currentStep: OmniSidebarStep
  editingStep: OmniSidebarEditingStep
  hasErrors: boolean
  isAllowanceLoading: boolean
  isFormFrozen: boolean
  isFormValid: boolean
  isOpening: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTransitionInProgress: boolean
  isTransitionWaitingForApproval: boolean
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  safetySwitch: boolean
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
    (safetySwitch && isOpening && currentStep !== 'risk') ||
    (safetySwitch &&
      !isOpening &&
      currentStep !== 'risk' &&
      [
        'deposit-borrow',
        'generate-borrow',
        'adjust',
        'deposit-collateral-multiply',
        'generate-multiply',
        'deposit-earn',
      ].includes(action as string))
  const isTextButtonHidden = !(
    (currentStep === 'transaction' && (!isTxStarted || isTxError)) ||
    (isTransitionWaitingForApproval && !isTransitionInProgress)
  )

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
