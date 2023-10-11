import type {
  AjnaFormAction,
  ProtocolFlow,
  ProtocolSidebarEditingStep,
  ProtocolSidebarStep,
} from 'features/ajna/common/types'

export function getAjnaSidebarButtonsStatus({
  action,
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
  action?: AjnaFormAction
  ajnaSafetySwitchOn: boolean
  currentStep: ProtocolSidebarStep
  editingStep: ProtocolSidebarEditingStep
  flow: ProtocolFlow
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
    (ajnaSafetySwitchOn && flow === 'open' && currentStep !== 'risk') ||
    (ajnaSafetySwitchOn &&
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
