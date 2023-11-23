import type { TxStatus } from '@oasisdex/transactions'
import type { OmniBorrowFormState } from 'features/omni-kit/state/borrow'
import type { OmniEarnFormState } from 'features/omni-kit/state/earn'
import type { OmniMultiplyFormState } from 'features/omni-kit/state/multiply'
import type { OmniFormState } from 'features/omni-kit/types'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniProductType,
  OmniSidebarStep,
} from 'features/omni-kit/types'

type StateTypeWrapper =
  | { type: OmniProductType.Borrow; state: OmniBorrowFormState }
  | { type: OmniProductType.Earn; state: OmniEarnFormState }
  | { type: OmniProductType.Multiply; state: OmniMultiplyFormState }

type StateTypeWrapperUnguarded = { type: OmniProductType; state: OmniFormState }

interface GetIsFormEmptyParams {
  currentStep: OmniSidebarStep
  stateTypeWrapper: StateTypeWrapper
  txStatus?: TxStatus
}

function testIfObjectIsType<T extends StateTypeWrapper>(
  obj: StateTypeWrapperUnguarded,
  productType: OmniProductType,
): obj is T {
  return obj.type === productType && obj.state.productType === productType
}

export function getOmniIsFormEmptyStateGuard(
  stateTypeWrapper: StateTypeWrapperUnguarded,
): StateTypeWrapper {
  const isEarn = testIfObjectIsType<{ type: OmniProductType.Earn; state: OmniEarnFormState }>(
    stateTypeWrapper,
    OmniProductType.Earn,
  )
  const isBorrow = testIfObjectIsType<{ type: OmniProductType.Borrow; state: OmniBorrowFormState }>(
    stateTypeWrapper,
    OmniProductType.Borrow,
  )
  const isMultiply = testIfObjectIsType<{
    type: OmniProductType.Multiply
    state: OmniMultiplyFormState
  }>(stateTypeWrapper, OmniProductType.Multiply)

  if (isEarn) {
    return stateTypeWrapper
  }

  if (isBorrow) {
    return stateTypeWrapper
  }

  if (isMultiply) {
    return stateTypeWrapper
  }

  throw Error('productType/state pair is invalid')
}

export function getOmniIsFormEmpty({
  stateTypeWrapper,
  currentStep,
  txStatus,
}: GetIsFormEmptyParams): boolean {
  switch (stateTypeWrapper.type) {
    case OmniProductType.Borrow: {
      const { depositAmount, generateAmount, paybackAmount, withdrawAmount, action, loanToValue } =
        stateTypeWrapper.state

      if (action === OmniBorrowFormAction.CloseBorrow) {
        return false
      }

      return !depositAmount && !generateAmount && !paybackAmount && !withdrawAmount && !loanToValue
    }
    case OmniProductType.Multiply: {
      const { depositAmount, loanToValue, withdrawAmount, generateAmount, paybackAmount, action } =
        stateTypeWrapper.state

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
    }
    case OmniProductType.Earn:
      throw Error('Earn isFormEmpty has to be handled separately')
  }
}
