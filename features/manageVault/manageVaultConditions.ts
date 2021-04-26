import { isNullish } from 'helpers/functions'
import { ManageVaultState } from './manageVault'

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
  return {
    ...state,
    editingButtonDisabled,
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    vaultWillBeUnderCollateralizedAtCurrentPrice,
    vaultWillBeUnderCollateralizedAtNextPrice,
    accountIsController,
  }
}
