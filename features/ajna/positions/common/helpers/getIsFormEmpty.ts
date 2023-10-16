import type { AjnaEarnPosition } from '@oasisdex/dma-library'
import type { TxStatus } from '@oasisdex/transactions'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaFormState } from 'features/ajna/common/types/AjnaFormState.types'
import type { BorrowFormState } from 'features/ajna/positions/borrow/state/borrowFormReducto.types'
import { areEarnPricesEqual } from 'features/ajna/positions/earn/helpers/areEarnPricesEqual'
import type { EarnFormState } from 'features/ajna/positions/earn/state/earnFormReducto.types'
import type { MultiplyFormState } from 'features/ajna/positions/multiply/state/multiplyFormReducto.types'
import type { ProtocolProduct, ProtocolSidebarStep } from 'features/unifiedProtocol/types'

interface GetIsFormEmptyParams {
  product: ProtocolProduct
  state: AjnaFormState
  position: AjnaGenericPosition
  currentStep: ProtocolSidebarStep
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
        state as BorrowFormState

      if (action === 'close-borrow') {
        return false
      }

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount && !loanToValue
    }
    case 'earn': {
      const { depositAmount, withdrawAmount, price } = state as EarnFormState

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
        state as MultiplyFormState

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
