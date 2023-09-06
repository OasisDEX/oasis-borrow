import BigNumber from 'bignumber.js'
import { BaseAaveContext } from 'features/aave/types/base-aave-context'
import { ManageCollateralActionsEnum } from 'features/aave/types/manage-collateral-actions-enum'
import { ManageDebtActionsEnum } from 'features/aave/types/manage-debt-actions-enum'
import { zero } from 'helpers/zero'

function allowanceForToken(
  transactionToken: string,
  context: BaseAaveContext,
): BigNumber | undefined {
  switch (transactionToken) {
    case context.tokens.collateral:
      return context.allowance?.collateral
    case context.tokens.debt:
      return context.allowance?.debt
    case context.tokens.deposit:
      return context.allowance?.deposit
    default:
      return zero
  }
}

export function isAllowanceNeeded(context: BaseAaveContext): boolean {
  const token = context.transactionToken || context.tokens.deposit

  if (token === 'ETH') {
    return false
  }

  const allowance = allowanceForToken(token, context)

  const isDepositingAction =
    context.manageTokenInput?.manageTokenAction ===
    ManageCollateralActionsEnum.DEPOSIT_COLLATERAL ||
    context.manageTokenInput?.manageTokenAction === ManageDebtActionsEnum.PAYBACK_DEBT ||
    (context.userInput.amount || zero).gt(zero)

  return (
    isDepositingAction &&
    (context.userInput.amount || context.manageTokenInput?.manageTokenActionValue || zero).gt(
      allowance || zero,
    )
  )
}
