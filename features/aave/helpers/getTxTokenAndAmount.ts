import type BigNumber from 'bignumber.js'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave'
import type { BaseAaveContext } from 'features/aave/types'
import { zero } from 'helpers/zero'

export function getTxTokenAndAmount(context: BaseAaveContext) {
  // FIX IT whole logic below should be happening in xstate machine probably, we should not do that here
  const isBorrowOrPaybackDebt = context.manageTokenInput
    ? [ManageDebtActionsEnum.BORROW_DEBT, ManageDebtActionsEnum.PAYBACK_DEBT].includes(
        context.manageTokenInput.manageAction as ManageDebtActionsEnum,
      )
    : false
  const isBorrowingDebt =
    context.manageTokenInput?.manageAction === ManageDebtActionsEnum.BORROW_DEBT

  const isWithdrawingCollateral =
    context.manageTokenInput?.manageAction === ManageCollateralActionsEnum.WITHDRAW_COLLATERAL

  const amountAndToken = {
    amount: context.userInput.amount || context.manageTokenInput?.manageInput1Value || zero,
    token: context.userInput.amount ? context.tokens.deposit : context.tokens.collateral,
  }
  if (isBorrowingDebt || isWithdrawingCollateral) {
    amountAndToken.amount = zero
  }
  if (isBorrowOrPaybackDebt) {
    amountAndToken.token = context.tokens.debt
  }
  // if we are borrowing and also depositing collateral, we need to use manageInput2Value and set token to collateral
  const isDepositWithBorrowNotEmpty = context.manageTokenInput?.manageInput2Value?.gt(zero)
  if (isBorrowingDebt && isDepositWithBorrowNotEmpty) {
    amountAndToken.amount = context.manageTokenInput?.manageInput2Value || zero
    amountAndToken.token = context.tokens.collateral
  }

  return amountAndToken as {
    amount: BigNumber
    token: string
  }
}
