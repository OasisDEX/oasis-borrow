import { AjnaStatusStep } from 'features/ajna/common/types'
import { SxStyleProp } from 'theme-ui'

export function getAjnaWithArrowColorScheme(): SxStyleProp {
  return {
    color: 'interactive100',
    transition: 'color 200ms',
    '&:hover': { color: 'interactive50' },
  }
}
export function getPrimaryButtonLabelKey({ currentStep }: { currentStep: AjnaStatusStep }): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    default:
      return 'confirm'
  }
}
