import { AjnaFlow, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: AjnaSidebarStep
  flow: AjnaFlow
  hasAllowance: boolean
  hasDpmAddress: boolean
  isTransitionInProgress: boolean
  isTxError: boolean
  isTxSuccess: boolean
  product: AjnaProduct
  walletAddress?: string
}

export function getPrimaryButtonLabelKey({
  currentStep,
  flow,
  hasAllowance,
  hasDpmAddress,
  isTransitionInProgress,
  isTxError,
  isTxSuccess,
  walletAddress,
}: GetPrimaryButtonLabelKeyParams): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    case 'transaction':
      if (isTxSuccess && flow === 'open') return 'system.go-to-position'
      else if (isTxError) return 'retry'
      else return 'confirm'
    case 'transition':
      if (isTransitionInProgress) return 'borrow-to-multiply.button-progress'
      else return 'confirm'
    default:
      if (walletAddress && hasDpmAddress && hasAllowance) return 'confirm'
      else if (walletAddress && hasDpmAddress) return 'set-token-allowance'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
