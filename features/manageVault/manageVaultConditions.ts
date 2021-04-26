import { isNullish } from 'helpers/functions'
import { one, zero } from 'helpers/zero'
import { ManageVaultState } from './manageVault'

export interface ManageVaultConditions {
  editingButtonDisabled: boolean
  depositAndWithdrawAmountsEmpty: boolean
  generateAndPaybackAmountsEmpty: boolean
  vaultWillBeUnderCollateralizedAtCurrentPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean
  accountIsController: boolean
  withdrawAmountExceedsFreeCollateral: boolean
  withdrawAmountExceedsFreeCollateralAtNextPrice: boolean
  generateAmountExceedsDaiYieldFromTotalCollateral: boolean
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: boolean
  generateAmountIsLessThanDebtFloor: boolean
  shouldPaybackAll: boolean
  debtWillBeLessThanDebtFloor: boolean
}

export const defaultManageVaultConditions: ManageVaultConditions = {
  editingButtonDisabled: true,
  vaultWillBeUnderCollateralizedAtCurrentPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,
  depositAndWithdrawAmountsEmpty: true,
  generateAndPaybackAmountsEmpty: true,
  accountIsController: false,
  withdrawAmountExceedsFreeCollateral: false,
  withdrawAmountExceedsFreeCollateralAtNextPrice: false,
  generateAmountExceedsDaiYieldFromTotalCollateral: false,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: false,
  generateAmountIsLessThanDebtFloor: false,
  shouldPaybackAll: false,
  debtWillBeLessThanDebtFloor: false,
}
// This value ought to be coupled in relation to how much we round the raw debt
// value in the vault (vault.debt)
export const PAYBACK_ALL_BOUND = one

export function applyManageVaultConditions(state: ManageVaultState): ManageVaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    ilkData,
    vault,
    account,
    daiYieldFromTotalCollateral,
    daiYieldFromTotalCollateralAtNextPrice,
    balanceInfo: { daiBalance },
  } = state

  const changeCouldIncreaseCollateralizationRatio =
    !isNullish(generateAmount) || !isNullish(withdrawAmount)

  const depositAndWithdrawAmountsEmpty = isNullish(depositAmount) && isNullish(withdrawAmount)
  const generateAndPaybackAmountsEmpty = isNullish(generateAmount) && isNullish(paybackAmount)

  const vaultWillBeUnderCollateralizedAtCurrentPrice =
    changeCouldIncreaseCollateralizationRatio &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralizedAtCurrentPrice &&
    changeCouldIncreaseCollateralizationRatio &&
    afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const editingButtonDisabled =
    (depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty) ||
    vaultWillBeUnderCollateralizedAtCurrentPrice ||
    vaultWillBeUnderCollateralizedAtNextPrice

  const accountIsController = account === vault.controller

  const withdrawAmountExceedsFreeCollateral = !!withdrawAmount?.gt(vault.freeCollateral)

  const withdrawAmountExceedsFreeCollateralAtNextPrice =
    !withdrawAmountExceedsFreeCollateral && !!withdrawAmount?.gt(vault.freeCollateralAtNextPrice)

  const generateAmountExceedsDaiYieldFromTotalCollateral = !!generateAmount?.gt(
    daiYieldFromTotalCollateral,
  )

  const generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromTotalCollateral &&
    !!generateAmount?.gt(daiYieldFromTotalCollateralAtNextPrice)

  const generateAmountIsLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.plus(vault.debt).isZero() &&
    generateAmount.plus(vault.debt).lt(ilkData.debtFloor)
  )

  const shouldPaybackAll = !!(
    daiBalance.gte(vault.debt) &&
    paybackAmount &&
    paybackAmount.plus(PAYBACK_ALL_BOUND).gte(vault.debt) &&
    !paybackAmount.gt(vault.debt)
  )

  const debtWillBeLessThanDebtFloor = !!(
    paybackAmount &&
    vault.debt.minus(paybackAmount).lt(ilkData.debtFloor) &&
    vault.debt.minus(paybackAmount).gt(zero) &&
    !shouldPaybackAll
  )

  return {
    ...state,
    editingButtonDisabled,
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    vaultWillBeUnderCollateralizedAtCurrentPrice,
    vaultWillBeUnderCollateralizedAtNextPrice,
    accountIsController,
    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountIsLessThanDebtFloor,
    shouldPaybackAll,
    debtWillBeLessThanDebtFloor,
  }
}
