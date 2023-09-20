import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type { AjnaGenericPosition, AjnaProduct, AjnaSidebarStep } from 'features/ajna/common/types'
import type { AjnaFormState } from 'features/ajna/common/types/AjnaFormState.types'
import type { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto.types'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto.types'
import type { AjnaMultiplyFormState } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto.types'

interface GetIsFormEmptyParams {
  product: AjnaProduct
  state: AjnaFormState
  position: AjnaGenericPosition
  currentStep: AjnaSidebarStep
  txStatus?: TxStatus
}

export function getIsFormEmpty({
  product,
  state,
  position,
  currentStep,
  txStatus,
}: GetIsFormEmptyParams): boolean {
  switch (product) {
    case 'borrow': {
      const { depositAmount, generateAmount, paybackAmount, withdrawAmount, action, loanToValue } =
        state as AjnaBorrowFormState

      if (action === 'close-borrow') {
        return false
      }

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount && !loanToValue
    }
    case 'earn': {
      const { depositAmount, withdrawAmount, price } = state as AjnaEarnFormState

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
        state as AjnaMultiplyFormState

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
