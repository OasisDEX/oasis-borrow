import { RefinanceSidebarStep } from 'features/refinance/types'

interface GetOmniSidebarButtonsStatusParams {
  currentStep: RefinanceSidebarStep
  hasErrors: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTxInProgress: boolean
  isTxSuccess: boolean
  isTxWaitingForApproval: boolean
  safetySwitch: boolean
  shouldSwitchNetwork: boolean
  suppressValidation: boolean
  walletAddress?: string
  gasEstimation?: boolean
}

export function getRefinanceSidebarButtonsStatus({
  currentStep,
  hasErrors,
  isOwner,
  isSimulationLoading,
  isTxInProgress,
  isTxSuccess,
  isTxWaitingForApproval,
  safetySwitch,
  shouldSwitchNetwork,
  suppressValidation,
  walletAddress,
  gasEstimation,
}: GetOmniSidebarButtonsStatusParams) {
  const isPrimaryButtonDisabled =
    suppressValidation || isTxSuccess
      ? false
      : !!walletAddress &&
        !shouldSwitchNetwork &&
        (hasErrors ||
          isSimulationLoading ||
          isTxInProgress ||
          isTxWaitingForApproval ||
          !gasEstimation)

  const isPrimaryButtonLoading = isTxSuccess
    ? false
    : !!walletAddress &&
      !shouldSwitchNetwork &&
      (isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isPrimaryButtonHidden =
    !!(walletAddress && !isOwner) ||
    safetySwitch ||
    [RefinanceSidebarStep.Option, RefinanceSidebarStep.Strategy].includes(currentStep)

  const isTextButtonHidden =
    currentStep === RefinanceSidebarStep.Option || isTxInProgress || isTxSuccess

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}
