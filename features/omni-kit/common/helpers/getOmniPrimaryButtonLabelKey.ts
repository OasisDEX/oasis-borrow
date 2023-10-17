import type { AjnaGenericPosition } from 'features/ajna/common/types'
import { getOmniIsFormEmpty } from 'features/omni-kit/common/helpers/getOmniIsFormEmpty'
import type {
  OmniFlow,
  OmniFormState,
  OmniProduct,
  OmniSidebarStep,
} from 'features/omni-kit/types/common.types'

interface GetPrimaryButtonLabelKeyParams {
  state: OmniFormState
  position: AjnaGenericPosition
  currentStep: OmniSidebarStep
  flow: OmniFlow
  hasAllowance: boolean
  hasDpmAddress: boolean
  isTransitionInProgress: boolean
  isTxError: boolean
  isTxSuccess: boolean
  product: OmniProduct
  walletAddress?: string
}

export function getOmniPrimaryButtonLabelKey({
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
        getOmniIsFormEmpty({ product, state, position, currentStep }) ||
        (walletAddress && hasDpmAddress && hasAllowance)
      )
        return 'confirm'
      else if (walletAddress && hasDpmAddress) return 'set-token-allowance'
      else if (walletAddress) return 'dpm.create-flow.welcome-screen.create-button'
      else return 'connect-wallet-button'
  }
}
