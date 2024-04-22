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
}: GetOmniSidebarButtonsStatusParams) {
  const isPrimaryButtonDisabled = suppressValidation
    ? false
    : !!walletAddress &&
      !shouldSwitchNetwork &&
      (hasErrors || isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isPrimaryButtonLoading =
    !!walletAddress &&
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
