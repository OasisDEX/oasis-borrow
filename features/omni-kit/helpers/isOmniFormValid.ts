import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState, OmniSidebarStep } from 'features/omni-kit/types'
import { OmniProductType } from 'features/omni-kit/types'

export const isOmniFormValid = ({
  currentStep,
  productType,
  state,
  earnIsFormValid,
}: {
  currentStep: OmniSidebarStep
  earnIsFormValid: boolean
  productType: OmniProductType
  state: OmniFormState
}): boolean => {
  switch (productType) {
    case OmniProductType.Borrow: {
      const { action, generateAmount, depositAmount, paybackAmount, withdrawAmount, loanToValue } =
        state as OmniBorrowFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-borrow':
            case 'deposit-borrow':
              return !!depositAmount?.gt(0) || !!generateAmount?.gt(0)
            case 'withdraw-borrow':
              return !!withdrawAmount?.gt(0) || !!paybackAmount?.gt(0)
            case 'generate-borrow':
              return !!generateAmount?.gt(0) || !!depositAmount?.gt(0)
            case 'payback-borrow':
              return !!paybackAmount?.gt(0) || !!withdrawAmount?.gt(0)
            case 'switch-borrow':
              return true
            case 'close-borrow':
              return true
            case 'adjust-borrow':
              return !!loanToValue
            default:
              return false
          }
        default:
          return true
      }
    }

    case OmniProductType.Multiply:
      const { action, depositAmount, withdrawAmount, loanToValue, paybackAmount, generateAmount } =
        state as OmniMultiplyFormState

      switch (currentStep) {
        case 'setup':
        case 'manage':
          switch (action) {
            case 'open-multiply':
              return !!depositAmount?.gt(0)
            case 'adjust':
              return !!loanToValue
            case 'generate-multiply':
            case 'deposit-collateral-multiply':
              return !!depositAmount || !!generateAmount
            case 'payback-multiply':
            case 'withdraw-multiply':
              return !!withdrawAmount || !!paybackAmount
            case 'deposit-quote-multiply':
              return !!loanToValue && !!depositAmount
            case 'switch-multiply':
            case 'close-multiply':
              return true
            default:
              return false
          }
        default:
          return true
      }
    // earn can be wild between protocols, that's why we need to handle it through dependency injection
    case OmniProductType.Earn: {
      return earnIsFormValid
    }
  }
}
