import type { TxStatus } from '@oasisdex/transactions'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow/borrowFormReducto.types'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply/multiplyFormReducto.types'
import type {
  OmniFormState,
  OmniProduct,
  OmniSidebarStep,
} from 'features/omni-kit/types/common.types'

interface GetIsFormEmptyParams {
  product: OmniProduct
  state: OmniFormState
  currentStep: OmniSidebarStep
  txStatus?: TxStatus
  earnIsFormEmpty: boolean
}

export function getOmniIsFormEmpty({
  product,
  state,
  currentStep,
  txStatus,
  earnIsFormEmpty,
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
    case 'earn': {
      return earnIsFormEmpty
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
  }
}
