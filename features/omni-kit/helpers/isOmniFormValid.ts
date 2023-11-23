import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
  OmniSidebarStep,
} from 'features/omni-kit/types'

interface isOmniFormValidParams {
  currentStep: OmniSidebarStep
  earnIsFormValid: boolean
  productType: OmniProductType
  state: OmniFormState
}

export const isOmniFormValid = ({
  currentStep,
  productType,
  state,
  earnIsFormValid,
}: isOmniFormValidParams): boolean => {
  switch (productType) {
    case OmniProductType.Borrow: {
      const { action, generateAmount, depositAmount, paybackAmount, withdrawAmount, loanToValue } =
        state as OmniBorrowFormState

      switch (currentStep) {
        case OmniSidebarStep.Setup:
        case OmniSidebarStep.Manage:
          switch (action) {
            case OmniBorrowFormAction.DepositBorrow:
            case OmniBorrowFormAction.OpenBorrow:
              return !!depositAmount?.gt(0) || !!generateAmount?.gt(0)
            case OmniBorrowFormAction.WithdrawBorrow:
              return !!withdrawAmount?.gt(0) || !!paybackAmount?.gt(0)
            case OmniBorrowFormAction.GenerateBorrow:
              return !!generateAmount?.gt(0) || !!depositAmount?.gt(0)
            case OmniBorrowFormAction.PaybackBorrow:
              return !!paybackAmount?.gt(0) || !!withdrawAmount?.gt(0)
            case OmniBorrowFormAction.CloseBorrow:
            case OmniBorrowFormAction.SwitchBorrow:
              return true
            case OmniBorrowFormAction.AdjustBorrow:
              return !!loanToValue
            default:
              return false
          }
        default:
          return true
      }
    }

    case OmniProductType.Multiply: {
      const { action, depositAmount, withdrawAmount, loanToValue, paybackAmount, generateAmount } =
        state as OmniMultiplyFormState

      switch (currentStep) {
        case OmniSidebarStep.Setup:
        case OmniSidebarStep.Manage:
          switch (action) {
            case OmniMultiplyFormAction.OpenMultiply:
              return !!depositAmount?.gt(0)
            case OmniMultiplyFormAction.AdjustMultiply:
              return !!loanToValue
            case OmniMultiplyFormAction.GenerateMultiply:
            case OmniMultiplyFormAction.DepositCollateralMultiply:
              return !!depositAmount || !!generateAmount
            case OmniMultiplyFormAction.PaybackMultiply:
            case OmniMultiplyFormAction.WithdrawMultiply:
              return !!withdrawAmount || !!paybackAmount
            case OmniMultiplyFormAction.DepositQuoteMultiply:
              return !!loanToValue && !!depositAmount
            case OmniMultiplyFormAction.SwitchMultiply:
            case OmniMultiplyFormAction.CloseMultiply:
              return true
            default:
              return false
          }
        default:
          return true
      }
    }
    // earn can be wild between protocols, that's why we need to handle it through dependency injection
    case OmniProductType.Earn: {
      return earnIsFormValid
    }
  }
}
