import { AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { SxStyleProp } from 'theme-ui'

interface GetKeyMethodParams {
  currentStep: AjnaStatusStep
  product: AjnaProduct
}

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
  walletAddress,
}: GetKeyMethodParams & { dpmAddress?: string; walletAddress?: string }): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    default:
      if (dpmAddress) return 'confirm'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}

export function getTextButtonLabelKey({ currentStep }: GetKeyMethodParams): string {
  switch (currentStep) {
    default:
      return 'back-to-editing'
  }
}
