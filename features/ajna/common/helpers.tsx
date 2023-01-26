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

export function getPrimaryButtonLabelKey({ currentStep }: GetKeyMethodParams): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    default:
      return 'confirm'
  }
}

export function getTextButtonLabelKey({ currentStep }: GetKeyMethodParams): string {
  switch (currentStep) {
    default:
      return 'back-to-editing'
  }
}
