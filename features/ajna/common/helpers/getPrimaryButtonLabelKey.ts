import { AjnaFlow, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'

interface GetPrimaryButtonLabelKeyParams {
  currentStep: AjnaSidebarStep
  dpmAddress?: string
  flow: AjnaFlow
  isTxError: boolean
  isTxSuccess: boolean
  product: AjnaProduct
  walletAddress?: string
}

export function getPrimaryButtonLabelKey({
  currentStep,
  dpmAddress,
  flow,
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
    default:
      if (walletAddress && dpmAddress) return 'confirm'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
