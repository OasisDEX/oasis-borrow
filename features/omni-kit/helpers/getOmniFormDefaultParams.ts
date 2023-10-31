import {
  OmniBorrowFormAction,
  OmniEarnFormAction,
  OmniMultiplyFormAction,
} from 'features/omni-kit/types'

export const getOmniFormDefaultParams = ({ isOpening }: { isOpening: boolean }) => {
  return {
    borrow: {
      action: isOpening ? OmniBorrowFormAction.OpenBorrow : OmniBorrowFormAction.DepositBorrow,
    },
    earn: {
      action: isOpening ? OmniEarnFormAction.OpenEarn : OmniEarnFormAction.DepositEarn,
    },
    multiply: {
      action: isOpening
        ? OmniMultiplyFormAction.OpenMultiply
        : OmniMultiplyFormAction.AdjustMultiply,
    },
  }
}
