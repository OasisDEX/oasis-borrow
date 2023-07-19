import {
  AjnaFlow,
  AjnaFormState,
  AjnaGenericPosition,
  AjnaProduct,
  AjnaSidebarStep,
} from 'features/ajna/common/types'
import { getIsFormEmpty } from 'features/ajna/positions/common/helpers/getIsFormEmpty'

interface GetPrimaryButtonLabelKeyParams {
  state: AjnaFormState
  position: AjnaGenericPosition
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
  position,
  product,
  state,
  walletAddress,
}: GetPrimaryButtonLabelKeyParams): string {
  switch (currentStep) {
    case 'risk':
      return 'i-understand'
    case 'nft':
      return 'confirm'
    case 'transaction':
      if (isTxSuccess && flow === 'open') return 'system.go-to-position'
      else if (isTxSuccess && flow === 'manage') return 'continue'
      else if (isTxError) return 'retry'
      else return 'confirm'
    case 'transition':
      if (isTransitionInProgress) return 'borrow-to-multiply.button-progress'
      else return 'confirm'
    default:
      if (
        getIsFormEmpty({ product, state, position, currentStep }) ||
        (walletAddress && hasDpmAddress && hasAllowance)
      )
        return 'confirm'
      else if (walletAddress && hasDpmAddress) return 'set-token-allowance'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
