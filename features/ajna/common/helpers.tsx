import { AjnaProduct, AjnaStatusStep } from 'features/ajna/common/types'
import { SxStyleProp } from 'theme-ui'

interface GetKeyMethodParams {
  currentStep: AjnaStatusStep
  product: AjnaProduct
  isTxSuccess: boolean
  isTxError: boolean
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
  isTxSuccess,
  isTxError,
}: GetKeyMethodParams & { dpmAddress?: string; walletAddress?: string }): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    case 'transaction':
      if (isTxSuccess) return 'system.go-to-position'
      else if (isTxError) return 'retry'
      else return 'confirm'
    default:
      if (walletAddress && dpmAddress) return 'confirm'
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
