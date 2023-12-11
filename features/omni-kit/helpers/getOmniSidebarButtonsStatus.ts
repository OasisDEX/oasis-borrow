import type { OmniFormAction, OmniSidebarEditingStep } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniEarnFormAction,
  OmniMultiplyFormAction,
  OmniSidebarStep,
} from 'features/omni-kit/types'

interface GetOmniSidebarButtonsStatusParams {
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
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

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
  shouldSwitchNetwork,
  walletAddress,
}: GetOmniSidebarButtonsStatusParams) {
  const isPrimaryButtonDisabled =
    !!walletAddress &&
    !shouldSwitchNetwork &&
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
    !shouldSwitchNetwork &&
    (isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval ||
      isTransitionInProgress)

  const isPrimaryButtonHidden =
    !!(walletAddress && !isOwner && currentStep === editingStep) ||
    (safetySwitch && isOpening && currentStep !== OmniSidebarStep.Risk) ||
    (safetySwitch &&
      !isOpening &&
      currentStep !== OmniSidebarStep.Risk &&
      [
        OmniBorrowFormAction.DepositBorrow,
        OmniBorrowFormAction.GenerateBorrow,
        OmniEarnFormAction.DepositEarn,
        OmniMultiplyFormAction.AdjustMultiply,
        OmniMultiplyFormAction.DepositCollateralMultiply,
        OmniMultiplyFormAction.GenerateMultiply,
      ].includes(action as OmniFormAction))
  const isTextButtonHidden = !(
    (currentStep === OmniSidebarStep.Transaction && (!isTxStarted || isTxError)) ||
    (isTransitionWaitingForApproval && !isTransitionInProgress)
  )

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
