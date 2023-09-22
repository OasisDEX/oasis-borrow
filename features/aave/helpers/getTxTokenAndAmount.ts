import type BigNumber from 'bignumber.js'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import type { BaseAaveContext } from 'features/aave/types'
import { zero } from 'helpers/zero'

export function getTxTokenAndAmount(context: BaseAaveContext) {
  // FIX IT whole logic below should be happening in xstate machine probably, we should not do that here
  const isBorrowOrPaybackDebt = context.manageTokenInput
    ? [ManageDebtActionsEnum.BORROW_DEBT, ManageDebtActionsEnum.PAYBACK_DEBT].includes(
        context.manageTokenInput.manageTokenAction as ManageDebtActionsEnum,
      )
    : false
  const isBorrowingDebt =
    context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.BORROW_DEBT

  const isWithdrawingCollateral =
    context.manageTokenInput?.manageTokenAction === ManageCollateralActionsEnum.WITHDRAW_COLLATERAL

  const amountAndToken = {
    amount: context.userInput.amount || context.manageTokenInput?.manageTokenActionValue || zero,
    token: context.userInput.amount ? context.tokens.deposit : context.tokens.collateral,
  }
  if (isBorrowingDebt || isWithdrawingCollateral) {
    amountAndToken.amount = zero
  }
  if (isBorrowOrPaybackDebt) {
    amountAndToken.token = context.tokens.debt
  }

  return amountAndToken as {
    amount: BigNumber
    token: string
  }
}
