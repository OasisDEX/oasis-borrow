import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow/borrowFormReducto.types'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn/earnFormReducto.types'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply/multiplyFormReducto.types'
import type {
  OmniFormState,
  OmniGenericPosition,
  OmniProduct,
  OmniSidebarStep,
} from 'features/omni-kit/types/common.types'

interface GetIsFormEmptyParams {
  product: OmniProduct
  state: OmniFormState
  position: OmniGenericPosition
  currentStep: OmniSidebarStep
  txStatus?: TxStatus
}

export function getOmniIsFormEmpty({
  product,
  state,
  position,
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
    case 'earn': {
      const { depositAmount, withdrawAmount, price } = state as OmniEarnFormState

      switch (currentStep) {
        case 'setup':
          return !depositAmount && !withdrawAmount
        case 'dpm':
        case 'transaction':
          return txStatus === 'Success'
        case 'manage':
          if ((position as AjnaEarnPosition).quoteTokenAmount.isZero()) {
            return !depositAmount && !withdrawAmount
          }

          return (
            !depositAmount &&
            !withdrawAmount &&
            !!areEarnPricesEqual((position as AjnaEarnPosition).price, price)
          )
        default:
          return true
      }
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
