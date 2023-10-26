import type { TxStatus } from '@oasisdex/transactions'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState, OmniSidebarStep } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
} from 'features/omni-kit/types'

interface GetIsFormEmptyParams {
  currentStep: OmniSidebarStep
  productType: OmniProductType
  state: OmniFormState
  txStatus?: TxStatus
}

export function getOmniIsFormEmpty({
  productType,
  state,
  currentStep,
  txStatus,
}: GetIsFormEmptyParams): boolean {
  switch (productType) {
    case OmniProductType.Borrow: {
      const { depositAmount, generateAmount, paybackAmount, withdrawAmount, action, loanToValue } =
        state as OmniBorrowFormState

      if (action === OmniBorrowFormAction.CloseBorrow) {
        return false
      }

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount && !loanToValue
    }
    case OmniProductType.Multiply:
      const { depositAmount, loanToValue, withdrawAmount, generateAmount, paybackAmount, action } =
        state as OmniMultiplyFormState

      switch (currentStep) {
        case 'setup':
          return !depositAmount
        case 'dpm':
        case 'transaction':
          return txStatus === 'Success'
        case 'manage':
          if (action === OmniMultiplyFormAction.CloseMultiply) {
            return false
          }
          return (
            !loanToValue && !withdrawAmount && !depositAmount && !generateAmount && !paybackAmount
          )
        default:
          return true
      }
    case OmniProductType.Earn:
      throw Error('Earn isFormEmpty has to be handled separately')
  }
}
