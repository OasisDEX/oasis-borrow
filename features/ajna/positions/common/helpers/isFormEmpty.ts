import { AjnaEarnPosition } from '@oasisdex/oasis-actions-poc'
import {
  AjnaFormState,
  AjnaGenericPosition,
  AjnaProduct,
  AjnaSidebarStep,
} from 'features/ajna/common/types'
import { AjnaBorrowFormState } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import { AjnaEarnFormState } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'

interface IsFormEmptyParams {
  product: AjnaProduct
  state: AjnaFormState
  position: AjnaGenericPosition
  currentStep: AjnaSidebarStep
}

export function isFormEmpty({ product, state, position, currentStep }: IsFormEmptyParams): boolean {
  switch (product) {
    case 'borrow': {
      const { depositAmount, generateAmount, paybackAmount, withdrawAmount } =
        state as AjnaBorrowFormState

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount
    }
    case 'earn': {
      const { depositAmount, withdrawAmount, price } = state as AjnaEarnFormState

      switch (currentStep) {
        case 'setup':
          return !depositAmount && !withdrawAmount
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
      return true
  }
}
