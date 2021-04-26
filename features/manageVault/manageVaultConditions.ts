import { maxUint256 } from 'blockchain/calls/erc20'
import { isNullish } from 'helpers/functions'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { one, zero } from 'helpers/zero'
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
  isLoadingStage: boolean
  customCollateralAllowanceAmountEmpty: boolean
  customDaiAllowanceAmountEmpty: boolean
  invalidCustomCollateralAllowanceAmount: boolean
  invalidCustomDaiAllowanceAmount: boolean
}

export const defaultManageVaultConditions: ManageVaultConditions = {
  ...defaultManageVaultStageCategories,
  flowProgressionDisabled: false,
  vaultWillBeUnderCollateralizedAtCurrentPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,
  depositAndWithdrawAmountsEmpty: true,
  generateAndPaybackAmountsEmpty: true,
  inputAmountsEmpty: true,
  accountIsController: false,
  withdrawAmountExceedsFreeCollateral: false,
  withdrawAmountExceedsFreeCollateralAtNextPrice: false,
  generateAmountExceedsDaiYieldFromTotalCollateral: false,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: false,
  generateAmountIsLessThanDebtFloor: false,
  shouldPaybackAll: false,
  debtWillBeLessThanDebtFloor: false,
  isLoadingStage: false,
  customCollateralAllowanceAmountEmpty: false,
  customDaiAllowanceAmountEmpty: false,
  invalidCustomCollateralAllowanceAmount: false,
  invalidCustomDaiAllowanceAmount: false,
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
    stage,
    selectedCollateralAllowanceRadio,
    selectedDaiAllowanceRadio,
    collateralAllowanceAmount,
    daiAllowanceAmount,
  } = state

  const changeCouldIncreaseCollateralizationRatio =
    !isNullish(generateAmount) || !isNullish(withdrawAmount)

  const depositAndWithdrawAmountsEmpty = isNullish(depositAmount) && isNullish(withdrawAmount)
  const generateAndPaybackAmountsEmpty = isNullish(generateAmount) && isNullish(paybackAmount)

  const inputAmountsEmpty = depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty

  const vaultWillBeUnderCollateralizedAtCurrentPrice =
    changeCouldIncreaseCollateralizationRatio &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralizedAtCurrentPrice &&
    changeCouldIncreaseCollateralizationRatio &&
    afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

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

  const customCollateralAllowanceAmountEmpty =
    selectedCollateralAllowanceRadio === 'custom' && !collateralAllowanceAmount

  const customDaiAllowanceAmountEmpty =
    selectedDaiAllowanceRadio === 'custom' && !daiAllowanceAmount

  const invalidCustomCollateralAllowanceAmount = !!(
    selectedCollateralAllowanceRadio === 'custom' &&
    collateralAllowanceAmount &&
    (collateralAllowanceAmount.gt(maxUint256) ||
      (depositAmount && collateralAllowanceAmount.lt(depositAmount)))
  )

  const invalidCustomDaiAllowanceAmount = !!(
    selectedDaiAllowanceRadio &&
    daiAllowanceAmount &&
    (daiAllowanceAmount.gt(maxUint256) || (paybackAmount && daiAllowanceAmount.lt(paybackAmount)))
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
    vaultWillBeUnderCollateralizedAtCurrentPrice ||
    vaultWillBeUnderCollateralizedAtNextPrice ||
    customCollateralAllowanceAmountEmpty ||
    customDaiAllowanceAmountEmpty ||
    invalidCustomCollateralAllowanceAmount ||
    invalidCustomDaiAllowanceAmount

  return {
    ...state,
    ...categoriseManageVaultStages(stage),
    flowProgressionDisabled,
    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    inputAmountsEmpty,
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
    isLoadingStage,
    customCollateralAllowanceAmountEmpty,
    customDaiAllowanceAmountEmpty,

    invalidCustomCollateralAllowanceAmount,
    invalidCustomDaiAllowanceAmount,
  }
}
