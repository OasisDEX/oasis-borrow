import { AjnaFlow, AjnaSidebarEditingStep, AjnaSidebarStep } from 'features/ajna/common/types'

export function getAjnaSidebarButtonsStatus({
  currentStep,
  editingStep,
  isAllowanceLoading,
  isFormValid,
  isOwner,
  isSimulationLoading,
  isTxError,
  isTxInProgress,
  isTxStarted,
  isTxWaitingForApproval,
  walletAddress,
}: {
  currentStep: AjnaSidebarStep
  editingStep: AjnaSidebarEditingStep
  isAllowanceLoading: boolean
  isFormValid: boolean
  isOwner: boolean
  isSimulationLoading?: boolean
  isTxError: boolean
  isTxInProgress: boolean
  isTxStarted: boolean
  isTxWaitingForApproval: boolean
  walletAddress?: string
}) {
  const isPrimaryButtonDisabled =
    !!walletAddress &&
    (!isFormValid ||
      isAllowanceLoading ||
      isSimulationLoading ||
      isTxInProgress ||
      isTxWaitingForApproval)

  console.log('---')
  console.log(`walletAddress: ${walletAddress}`)
  console.log(`isFormValid: ${isFormValid}`)
  console.log(`isAllowanceLoading: ${isAllowanceLoading}`)
  console.log(`isSimulationLoading: ${isSimulationLoading}`)
  console.log(`isTxInProgress: ${isTxInProgress}`)
  console.log(`isTxWaitingForApproval: ${isTxWaitingForApproval}`)

  const isPrimaryButtonLoading =
    !!walletAddress &&
    (isAllowanceLoading || isSimulationLoading || isTxInProgress || isTxWaitingForApproval)

  const isPrimaryButtonHidden = !!(walletAddress && !isOwner && currentStep === editingStep)
  const isTextButtonHidden = !(currentStep === 'transaction' && (!isTxStarted || isTxError))

  return {
    isPrimaryButtonDisabled,
    isPrimaryButtonHidden,
    isPrimaryButtonLoading,
    isTextButtonHidden,
  }
}

export function getAjnaSidebarPrimaryButtonActions({
  currentStep,
  defaultAction,
  editingStep,
  flow,
  resolvedId,
  isTxSuccess,
  walletAddress,
}: {
  currentStep: string
  defaultAction: () => void
  editingStep: string
  flow: AjnaFlow
  resolvedId?: string
  isTxSuccess: boolean
  walletAddress?: string
}) {
  switch (true) {
    case !walletAddress && currentStep === editingStep:
      return { url: '/connect' }
    case isTxSuccess && flow === 'open':
      return { url: `/ajna/position/${resolvedId}` }
    default:
      return { action: defaultAction }
  }
}
