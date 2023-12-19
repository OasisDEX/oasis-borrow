import type BigNumber from 'bignumber.js'
import type { BaseAaveContext } from 'features/aave/types'
import { ManageCollateralActionsEnum, ManageDebtActionsEnum } from 'features/aave/types'

export function getDebtInputValue(context: BaseAaveContext): BigNumber | undefined {
  switch (context.manageTokenInput?.manageAction) {
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
      return context.manageTokenInput?.manageInput2Value
    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
      return context.manageTokenInput?.manageInput2Value

    case ManageDebtActionsEnum.BORROW_DEBT:
      return context.manageTokenInput?.manageInput1Value

    case ManageDebtActionsEnum.PAYBACK_DEBT:
      return context.manageTokenInput?.manageInput1Value

    default:
      return undefined
  }
}

export function getCollateralInputValue(context: BaseAaveContext): BigNumber | undefined {
  switch (context.manageTokenInput?.manageAction) {
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
      return context.manageTokenInput?.manageInput1Value

    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
      return context.manageTokenInput?.manageInput1Value

    case ManageDebtActionsEnum.BORROW_DEBT:
      return context.manageTokenInput?.manageInput2Value

    case ManageDebtActionsEnum.PAYBACK_DEBT:
      return context.manageTokenInput?.manageInput2Value

    default:
      return undefined
  }
}

export function getAllowanceTokenSymbol(context: BaseAaveContext): string | undefined {
  switch (context.manageTokenInput?.manageAction) {
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
    case ManageDebtActionsEnum.BORROW_DEBT:
      return context.tokens.collateral

    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
    case ManageDebtActionsEnum.PAYBACK_DEBT:
      return context.tokens.debt

    default:
      return undefined
  }
}

export function getAllowanceTokenAmount(context: BaseAaveContext): BigNumber | undefined {
  switch (context.manageTokenInput?.manageAction) {
    case ManageCollateralActionsEnum.DEPOSIT_COLLATERAL:
    case ManageDebtActionsEnum.BORROW_DEBT:
      return getCollateralInputValue(context)

    case ManageCollateralActionsEnum.WITHDRAW_COLLATERAL:
    case ManageDebtActionsEnum.PAYBACK_DEBT:
      return getDebtInputValue(context)

    default:
      return undefined
  }
}
