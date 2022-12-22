import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

import { BaseAaveContext } from '../common/BaseAaveContext'
import { ManageDebtActionsEnum } from '../strategyConfig'

export function getTxTokenAndAmount(context: BaseAaveContext) {
  const isBorrowOrPaybackDebt = context.manageTokenInput
    ? [ManageDebtActionsEnum.BORROW_DEBT, ManageDebtActionsEnum.PAYBACK_DEBT].includes(
        context.manageTokenInput.manageTokenAction as ManageDebtActionsEnum,
      )
    : false

  return {
    amount: context.userInput.amount || context.manageTokenInput?.manageTokenActionValue || zero,
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
