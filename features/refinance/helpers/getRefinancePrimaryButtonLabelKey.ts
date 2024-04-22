import { RefinanceSidebarStep } from 'features/refinance/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: RefinanceSidebarStep
  isTxError: boolean
  isTxSuccess: boolean
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getRefinancePrimaryButtonLabelKey({
  currentStep,
  isTxError,
  isTxSuccess,
  shouldSwitchNetwork,
  walletAddress,
}: GetPrimaryButtonLabelKeyParams): string {
  switch (currentStep) {
    case RefinanceSidebarStep.Changes:
      if (isTxSuccess) return 'system.go-to-position'
      else if (isTxError) return 'retry'
      else return 'confirm'
    case RefinanceSidebarStep.Give:
      if (isTxSuccess) return 'continue'
      else if (isTxError) return 'retry'
      else return 'confirm'
    default:
      if (walletAddress && shouldSwitchNetwork) return 'switch-network'
      if (!walletAddress) return 'connect-wallet-button'
      else return 'confirm'
  }
}
