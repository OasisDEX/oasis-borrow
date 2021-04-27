import { maxUint256 } from 'blockchain/calls/erc20'
import { isNullish } from 'helpers/functions'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import { ManageVaultStage, ManageVaultState } from './manageVault'

const defaultManageVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
}

export function categoriseManageVaultStages(stage: ManageVaultStage) {
  switch (stage) {
    case 'collateralEditing':
    case 'daiEditing':
      return {
        ...defaultManageVaultStageCategories,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...defaultManageVaultStageCategories,
        isProxyStage: true,
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isCollateralAllowanceStage: true,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isDaiAllowanceStage: true,
      }

    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageInProgress':
    case 'manageFailure':
    case 'manageSuccess':
      return {
        ...defaultManageVaultStageCategories,
        isManageStage: true,
      }
    default:
      throw new UnreachableCaseError(stage)
  }
}

export interface ManageVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isCollateralAllowanceStage: boolean
  isDaiAllowanceStage: boolean
  isManageStage: boolean

  flowProgressionDisabled: boolean

  depositAndWithdrawAmountsEmpty: boolean
  generateAndPaybackAmountsEmpty: boolean
  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean

  accountIsController: boolean
  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  withdrawAmountExceedsFreeCollateral: boolean
  withdrawAmountExceedsFreeCollateralAtNextPrice: boolean
  generateAmountExceedsDaiYieldFromTotalCollateral: boolean
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: boolean
  generateAmountLessThanDebtFloor: boolean
  generateAmountExceedsDebtCeiling: boolean
  paybackAmountExceedsVaultDebt: boolean
  paybackAmountExceedsDaiBalance: boolean

  debtWillBeLessThanDebtFloor: boolean
  isLoadingStage: boolean

  insufficientCollateralAllowance: boolean
  customCollateralAllowanceAmountEmpty: boolean
  customCollateralAllowanceAmountExceedsMaxUint256: boolean
  customCollateralAllowanceAmountLessThanDepositAmount: boolean

  insufficientDaiAllowance: boolean
  customDaiAllowanceAmountEmpty: boolean
  customDaiAllowanceAmountExceedsMaxUint256: boolean
  customDaiAllowanceAmountLessThanPaybackAmount: boolean
}

export const defaultManageVaultConditions: ManageVaultConditions = {
  ...defaultManageVaultStageCategories,
  flowProgressionDisabled: false,

  vaultWillBeAtRiskLevelWarning: false,
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeUnderCollateralized: false,

  vaultWillBeAtRiskLevelWarningAtNextPrice: false,
  vaultWillBeAtRiskLevelDangerAtNextPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,

  depositAndWithdrawAmountsEmpty: true,
  generateAndPaybackAmountsEmpty: true,
  inputAmountsEmpty: true,
  accountIsController: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  withdrawAmountExceedsFreeCollateral: false,
  withdrawAmountExceedsFreeCollateralAtNextPrice: false,
  generateAmountExceedsDaiYieldFromTotalCollateral: false,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: false,
  generateAmountLessThanDebtFloor: false,
  generateAmountExceedsDebtCeiling: false,
  paybackAmountExceedsVaultDebt: false,
  paybackAmountExceedsDaiBalance: false,

  debtWillBeLessThanDebtFloor: false,
  isLoadingStage: false,

  insufficientCollateralAllowance: false,
  customCollateralAllowanceAmountEmpty: false,
  customCollateralAllowanceAmountExceedsMaxUint256: false,
  customCollateralAllowanceAmountLessThanDepositAmount: false,

  insufficientDaiAllowance: false,
  customDaiAllowanceAmountEmpty: false,
  customDaiAllowanceAmountExceedsMaxUint256: false,
  customDaiAllowanceAmountLessThanPaybackAmount: false,
}

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
    stage,
    selectedCollateralAllowanceRadio,
    selectedDaiAllowanceRadio,
    collateralAllowanceAmount,
    daiAllowanceAmount,
    collateralAllowance,
    daiAllowance,
    afterFreeCollateral,
    afterFreeCollateralAtNextPrice,
    shouldPaybackAll,
    balanceInfo: { collateralBalance, daiBalance },
  } = state

  const depositAndWithdrawAmountsEmpty = isNullish(depositAmount) && isNullish(withdrawAmount)
  const generateAndPaybackAmountsEmpty = isNullish(generateAmount) && isNullish(paybackAmount)

  const inputAmountsEmpty = depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty

  const vaultWillBeAtRiskLevelDanger =
    !inputAmountsEmpty &&
    afterCollateralizationRatio.gte(ilkData.liquidationRatio) &&
    afterCollateralizationRatio.lte(ilkData.collateralizationDangerThreshold)

  const vaultWillBeAtRiskLevelDangerAtNextPrice =
    !vaultWillBeAtRiskLevelDanger &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.gte(ilkData.liquidationRatio) &&
    afterCollateralizationRatioAtNextPrice.lte(ilkData.collateralizationDangerThreshold)

  const vaultWillBeAtRiskLevelWarning =
    !inputAmountsEmpty &&
    afterCollateralizationRatio.gt(ilkData.collateralizationDangerThreshold) &&
    afterCollateralizationRatio.lte(ilkData.collateralizationWarningThreshold)

  const vaultWillBeAtRiskLevelWarningAtNextPrice =
    !vaultWillBeAtRiskLevelWarning &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.gt(ilkData.collateralizationDangerThreshold) &&
    afterCollateralizationRatioAtNextPrice.lte(ilkData.collateralizationWarningThreshold)

  const vaultWillBeUnderCollateralized =
    !inputAmountsEmpty &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const accountIsController = account === vault.controller

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const depositingAllEthBalance = vault.token === 'ETH' && !!depositAmount?.eq(collateralBalance)

  const withdrawAmountExceedsFreeCollateral = !!withdrawAmount?.gt(afterFreeCollateral)

  const withdrawAmountExceedsFreeCollateralAtNextPrice =
    !withdrawAmountExceedsFreeCollateral && !!withdrawAmount?.gt(afterFreeCollateralAtNextPrice)

  const generateAmountExceedsDaiYieldFromTotalCollateral = !!generateAmount?.gt(
    daiYieldFromTotalCollateral,
  )

  const generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromTotalCollateral &&
    !!generateAmount?.gt(daiYieldFromTotalCollateralAtNextPrice)

  const generateAmountLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.plus(vault.debt).isZero() &&
    generateAmount.plus(vault.debt).lt(ilkData.debtFloor)
  )

  const generateAmountExceedsDebtCeiling = !!generateAmount?.gt(ilkData.ilkDebtAvailable)

  const paybackAmountExceedsDaiBalance = !!paybackAmount?.gt(daiBalance)
  const paybackAmountExceedsVaultDebt = !!paybackAmount?.gt(vault.debt)

  const debtWillBeLessThanDebtFloor = !!(
    paybackAmount &&
    vault.debt.minus(paybackAmount).lt(ilkData.debtFloor) &&
    vault.debt.minus(paybackAmount).gt(zero) &&
    !shouldPaybackAll
  )

  const customCollateralAllowanceAmountEmpty =
    selectedCollateralAllowanceRadio === 'custom' && !collateralAllowanceAmount

  const customDaiAllowanceAmountEmpty =
    selectedDaiAllowanceRadio === 'custom' && !daiAllowanceAmount

  const customCollateralAllowanceAmountExceedsMaxUint256 = !!(
    selectedCollateralAllowanceRadio === 'custom' && collateralAllowanceAmount?.gt(maxUint256)
  )

  const customCollateralAllowanceAmountLessThanDepositAmount = !!(
    selectedCollateralAllowanceRadio === 'custom' &&
    collateralAllowanceAmount &&
    depositAmount &&
    collateralAllowanceAmount.lt(depositAmount)
  )

  const customDaiAllowanceAmountExceedsMaxUint256 = !!(
    selectedDaiAllowanceRadio === 'custom' && daiAllowanceAmount?.gt(maxUint256)
  )

  const customDaiAllowanceAmountLessThanPaybackAmount = !!(
    selectedDaiAllowanceRadio === 'custom' &&
    daiAllowanceAmount &&
    paybackAmount &&
    daiAllowanceAmount.lt(paybackAmount)
  )

  const insufficientCollateralAllowance =
    vault.token !== 'ETH' &&
    !!(
      depositAmount &&
      !depositAmount.isZero() &&
      (!collateralAllowance || depositAmount.gt(collateralAllowance))
    )

  const insufficientDaiAllowance = !!(
    paybackAmount &&
    !paybackAmount.isZero() &&
    (!daiAllowance || paybackAmount.gt(daiAllowance))
  )

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'collateralAllowanceWaitingForApproval',
    'collateralAllowanceInProgress',
    'daiAllowanceWaitingForApproval',
    'daiAllowanceInProgress',
    'manageInProgress',
    'manageWaitingForApproval',
  ] as ManageVaultStage[]).some((s) => s === stage)

  const flowProgressionDisabled =
    isLoadingStage ||
    inputAmountsEmpty ||
    vaultWillBeUnderCollateralized ||
    vaultWillBeUnderCollateralizedAtNextPrice ||
    customCollateralAllowanceAmountEmpty ||
    customCollateralAllowanceAmountExceedsMaxUint256 ||
    customCollateralAllowanceAmountLessThanDepositAmount ||
    customDaiAllowanceAmountEmpty ||
    customDaiAllowanceAmountExceedsMaxUint256 ||
    customDaiAllowanceAmountLessThanPaybackAmount ||
    debtWillBeLessThanDebtFloor ||
    depositAmountExceedsCollateralBalance ||
    depositingAllEthBalance ||
    generateAmountExceedsDebtCeiling ||
    generateAmountLessThanDebtFloor ||
    paybackAmountExceedsDaiBalance ||
    paybackAmountExceedsVaultDebt

  return {
    ...state,
    ...categoriseManageVaultStages(stage),
    flowProgressionDisabled,
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    inputAmountsEmpty,

    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,

    accountIsController,
    depositingAllEthBalance,
    depositAmountExceedsCollateralBalance,
    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountLessThanDebtFloor,
    paybackAmountExceedsDaiBalance,
    paybackAmountExceedsVaultDebt,
    shouldPaybackAll,
    debtWillBeLessThanDebtFloor,
    isLoadingStage,

    insufficientCollateralAllowance,
    customCollateralAllowanceAmountEmpty,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,

    insufficientDaiAllowance,
    customDaiAllowanceAmountEmpty,
    customDaiAllowanceAmountExceedsMaxUint256,
    customDaiAllowanceAmountLessThanPaybackAmount,
  }
}
