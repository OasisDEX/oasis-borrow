import { zero } from 'helpers/zero'

import { BaseAaveContext } from '../common/BaseAaveContext'
import { ManageDebtActionsEnum } from '../strategyConfig'

export function getTxTokenAndAmount(context: BaseAaveContext) {
  const isBorrowOrPaybackDebt = context.manageTokenInput
    ? [ManageDebtActionsEnum.BORROW_DEBT, ManageDebtActionsEnum.PAYBACK_DEBT].includes(
        context.manageTokenInput.manageTokenAction as ManageDebtActionsEnum,
      )
    : false
  const isAmountFromUserInputNeeded = (context.transactionToken || context.tokens.deposit) === 'ETH'

  return {
    amount:
      isAmountFromUserInputNeeded && !isBorrowOrPaybackDebt
        ? context.userInput.amount || context.manageTokenInput?.manageTokenActionValue
        : zero,
    token: isBorrowOrPaybackDebt ? context.tokens.debt : context.tokens.collateral,
  }
}
