import type { TxStatus } from '@oasisdex/transactions'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type {
  OmniFormState,
  OmniProduct,
  OmniSidebarStep,
} from 'features/omni-kit/types'

interface GetIsFormEmptyParams {
  product: OmniProduct
  state: OmniFormState
  currentStep: OmniSidebarStep
  txStatus?: TxStatus
}

export function getOmniIsFormEmpty({
  product,
  state,
  currentStep,
  txStatus,
}: GetIsFormEmptyParams): boolean {
  switch (product) {
    case 'borrow': {
      const { depositAmount, generateAmount, paybackAmount, withdrawAmount, action, loanToValue } =
        state as OmniBorrowFormState

      if (action === 'close-borrow') {
        return false
      }

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount && !loanToValue
    }
    case 'multiply':
      const { depositAmount, loanToValue, withdrawAmount, generateAmount, paybackAmount, action } =
        state as OmniMultiplyFormState

      switch (currentStep) {
        case 'setup':
          return !depositAmount
        case 'dpm':
        case 'transaction':
          return txStatus === 'Success'
        case 'manage':
          if (action === 'close-multiply') {
            return false
          }
          return (
            !loanToValue && !withdrawAmount && !depositAmount && !generateAmount && !paybackAmount
          )
        default:
          return true
      }
    case 'earn':
      throw Error('Earn isFormEmpty has to be handled separately')
  }
}
