import { AjnaFlow, AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { SxStyleProp } from 'theme-ui'

export function getAjnaWithArrowColorScheme(): SxStyleProp {
  return {
    color: 'interactive100',
    transition: 'color 200ms',
    '&:hover': { color: 'interactive50' },
  }
}

export function getPrimaryButtonLabelKey({
  currentStep,
  dpmAddress,
  flow,
  isTxError,
  isTxSuccess,
  walletAddress,
}: {
  currentStep: AjnaStatusStep
  dpmAddress?: string
  flow: AjnaFlow
  isTxError: boolean
  isTxSuccess: boolean
  product: AjnaProduct
  walletAddress?: string
}): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    case 'transaction':
      if (isTxSuccess && flow === 'open') return 'system.go-to-position'
      else if (isTxError) return 'retry'
      else return 'confirm'
    default:
      if (walletAddress && dpmAddress) return 'confirm'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
