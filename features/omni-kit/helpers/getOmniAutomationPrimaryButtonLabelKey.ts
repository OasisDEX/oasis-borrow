import { OmniSidebarAutomationStep } from 'features/omni-kit/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: OmniSidebarAutomationStep
  isTxError: boolean
  isTxSuccess: boolean
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getOmniAutomationPrimaryButtonLabelKey({
  currentStep,
  isTxError,
  isTxSuccess,
  shouldSwitchNetwork,
  walletAddress,
}: GetPrimaryButtonLabelKeyParams): string {
  switch (currentStep) {
    case OmniSidebarAutomationStep.Transaction:
      if (isTxSuccess) return 'continue'
      else if (isTxError) return 'retry'
      else return 'confirm'
    default:
      if (!walletAddress) return 'connect-wallet-button'
      else if (walletAddress && shouldSwitchNetwork) return 'switch-network'
      else return 'confirm'
  }
}
