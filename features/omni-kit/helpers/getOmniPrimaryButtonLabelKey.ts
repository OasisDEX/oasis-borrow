import { OmniSidebarStep } from 'features/omni-kit/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: OmniSidebarStep
  hasAllowance: boolean
  hasDpmAddress: boolean
  isOpening: boolean
  isTransitionInProgress: boolean
  isTxError: boolean
  isTxSuccess: boolean
  shouldSwitchNetwork: boolean
  walletAddress?: string
}

export function getOmniPrimaryButtonLabelKey({
  currentStep,
  hasAllowance,
  hasDpmAddress,
  isOpening,
  isTransitionInProgress,
  isTxError,
  isTxSuccess,
  shouldSwitchNetwork,
  walletAddress,
}: GetPrimaryButtonLabelKeyParams): string {
  switch (currentStep) {
    case OmniSidebarStep.Risk:
      return 'i-understand'
    case OmniSidebarStep.Transaction:
      if (isTxSuccess && isOpening) return 'system.go-to-position'
      else if (isTxSuccess && !isOpening) return 'continue'
      else if (isTxError) return 'retry'
      else return 'confirm'
    case OmniSidebarStep.Transition:
      if (isTransitionInProgress) return 'borrow-to-multiply.button-progress'
      else return 'confirm'
    default:
      if (walletAddress && shouldSwitchNetwork) return 'switch-network'
      else if (walletAddress && hasDpmAddress && hasAllowance) return 'confirm'
      else if (walletAddress && hasDpmAddress) return 'set-token-allowance'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
