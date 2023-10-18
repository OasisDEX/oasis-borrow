import type {
  OmniFlow,
  OmniFormAction,
  OmniSidebarEditingStep,
  OmniSidebarStep,
} from 'features/omni-kit/types/common.types'

export function getOmniSidebarButtonsStatus({
  action,
  safetySwitch,
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
  action?: OmniFormAction
  safetySwitch: boolean
  currentStep: OmniSidebarStep
  editingStep: OmniSidebarEditingStep
  flow: OmniFlow
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
    (safetySwitch && flow === 'open' && currentStep !== 'risk') ||
    (safetySwitch &&
      flow === 'manage' &&
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
