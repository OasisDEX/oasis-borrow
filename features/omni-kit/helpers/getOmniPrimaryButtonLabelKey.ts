import type { OmniSidebarBorrowPanel, OmniSidebarEarnPanel } from 'features/omni-kit/types'
import { OmniMultiplyPanel, OmniSidebarStep } from 'features/omni-kit/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: OmniSidebarStep
  hasAllowance: boolean
  hasDpmAddress: boolean
  isOpening: boolean
  isTxError: boolean
  isTxSuccess: boolean
  shouldSwitchNetwork: boolean
  walletAddress?: string
  uiDropdown: OmniMultiplyPanel | OmniSidebarEarnPanel | OmniSidebarBorrowPanel
}

export function getOmniPrimaryButtonLabelKey({
  currentStep,
  hasAllowance,
  hasDpmAddress,
  isOpening,
  isTxError,
  isTxSuccess,
  shouldSwitchNetwork,
  walletAddress,
  uiDropdown,
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
      return 'borrow-to-multiply.button-progress'
    default:
      if (walletAddress && shouldSwitchNetwork) return 'switch-network'
      else if (
        (walletAddress && hasDpmAddress && hasAllowance) ||
        uiDropdown === OmniMultiplyPanel.Switch
      )
        return 'confirm'
      else if (walletAddress && hasDpmAddress) return 'set-token-allowance'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
