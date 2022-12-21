import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

import { BaseAaveContext } from '../common/BaseAaveContext'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from '../strategyConfig'

export function getTxTokenAndAmount(context: BaseAaveContext) {
  const isDepositingAction =
    context.manageTokenInput?.manageTokenAction ===
      ManageCollateralActionsEnum.DEPOSIT_COLLATERAL ||
    context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.PAYBACK_DEBT

  const isBorrowOrPaybackDebt = context.manageTokenInput
    ? [ManageDebtActionsEnum.BORROW_DEBT, ManageDebtActionsEnum.PAYBACK_DEBT].includes(
        context.manageTokenInput.manageTokenAction as ManageDebtActionsEnum,
      )
    : false

  const isAmountFromUserInputNeeded = (context.transactionToken || context.tokens.deposit) === 'ETH'

  return {
    amount:
      isAmountFromUserInputNeeded && isDepositingAction
        ? context.userInput.amount || context.manageTokenInput!.manageTokenActionValue
        : zero,
    token: context.userInput.amount
      ? context.tokens.deposit
      : isBorrowOrPaybackDebt
      ? context.tokens.debt
      : context.tokens.collateral,
  } as {
    amount: BigNumber
    token: string
  }
}
