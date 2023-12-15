import { zero } from 'helpers/zero'
import { BaseAaveContext } from './base-aave-context'
import BigNumber from 'bignumber.js'
import { ManageDebtActionsEnum } from './manage-debt-actions-enum'
import { ManageCollateralActionsEnum } from './manage-collateral-actions-enum'

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
    context.manageTokenInput?.manageAction ===
    ManageCollateralActionsEnum.DEPOSIT_COLLATERAL ||
    context.manageTokenInput?.manageAction === ManageDebtActionsEnum.PAYBACK_DEBT ||
    (context.userInput.amount || zero).gt(zero)

  return (
    isDepositingAction &&
    (context.userInput.amount || context.manageTokenInput?.manageInput1Value || zero).gt(
      allowance || zero,
    )
  )
}

export function isAllowanceNeededManageActions(context: BaseAaveContext): boolean {
  const token = context.transactionToken || context.tokens.deposit
  console.log("token", context.transactionToken, context.tokens.deposit)
  console.log("user input", context.userInput.amount)
  if (token === 'ETH') {
    return false
  }

  // switch (context.manageTokenInput?.manageAction) {
  //   case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
  //     context.manageTokenInput?.manageInput2Value?.gt(zero)
  //     break;

  //   case ManageDebtActionsEnum.PAYBACK_DEBT:
  //     break

  //   default:
  //     break;
  // }



  const allowance = allowanceForToken(token, context)

  const isDepositingAction =
    context.manageTokenInput?.manageAction ===
    ManageCollateralActionsEnum.DEPOSIT_COLLATERAL ||
    context.manageTokenInput?.manageAction === ManageDebtActionsEnum.PAYBACK_DEBT ||
    (context.userInput.amount || zero).gt(zero)

  const inputGtZero =
    (context.userInput.amount || context.manageTokenInput?.manageInput1Value || zero).gt(
      allowance || zero,
    )

  return (
    isDepositingAction && inputGtZero
  )
}
