import type { TxStatus } from '@oasisdex/transactions'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
  OmniSidebarStep,
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
        case OmniSidebarStep.Setup:
          return !depositAmount
        case OmniSidebarStep.Dpm:
        case OmniSidebarStep.Transaction:
          return txStatus === 'Success'
        case OmniSidebarStep.Manage:
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
