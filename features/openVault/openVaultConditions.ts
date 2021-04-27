import { maxUint256 } from 'blockchain/calls/erc20'
import { isNullish } from 'helpers/functions'
import { zero } from 'helpers/zero'
import { OpenVaultStage, OpenVaultState } from './openVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

function categoriseOpenVaultStage(stage: OpenVaultStage) {
  switch (stage) {
    case 'editing':
      return {
        ...defaultOpenVaultStageCategories,
        isEditingStage: true,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isProxyStage: true,
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isAllowanceStage: true,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openSuccess':
      return {
        ...defaultOpenVaultStageCategories,
        isOpenStage: true,
      }
  }
}

export interface OpenVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateral: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: boolean
  generateAmountExceedsDebtCeiling: boolean
  generateAmountLessThanDebtFloor: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  flowProgressionDisabled: boolean
}

export const defaultOpenVaultConditions: OpenVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,

  vaultWillBeAtRiskLevelWarning: false,
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeUnderCollateralized: false,

  vaultWillBeAtRiskLevelWarningAtNextPrice: false,
  vaultWillBeAtRiskLevelDangerAtNextPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  generateAmountExceedsDaiYieldFromDepositingCollateral: false,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountLessThanDebtFloor: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  flowProgressionDisabled: false,
}

export function applyOpenVaultConditions(state: OpenVaultState): OpenVaultState {
  const {
    stage,
    generateAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    ilkData,
    token,
    balanceInfo: { collateralBalance },
    depositAmount,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,
    selectedAllowanceRadio,
    allowanceAmount,
    allowance,
  } = state

  const inputAmountsEmpty = !depositAmount && !generateAmount

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

  const vaultWillBeUnderCollateralized = !!(
    generateAmount?.gt(zero) &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()
  )

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !!(
      generateAmount?.gt(zero) &&
      afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
      !afterCollateralizationRatioAtNextPrice.isZero()
    )

  const depositingAllEthBalance = token === 'ETH' && !!depositAmount?.eq(collateralBalance)
  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const generateAmountExceedsDaiYieldFromDepositingCollateral = !!generateAmount?.gt(
    daiYieldFromDepositingCollateral,
  )

  const generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromDepositingCollateral &&
    !!generateAmount?.gt(daiYieldFromDepositingCollateralAtNextPrice)

  const generateAmountExceedsDebtCeiling = !!generateAmount?.gt(ilkData.ilkDebtAvailable)

  const generateAmountLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.isZero() &&
    generateAmount.lt(ilkData.debtFloor)
  )

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'openInProgress',
    'openWaitingForApproval',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const customAllowanceAmountEmpty = selectedAllowanceRadio === 'custom' && !allowanceAmount

  const customAllowanceAmountExceedsMaxUint256 = !!(
    selectedAllowanceRadio === 'custom' && allowanceAmount?.gt(maxUint256)
  )

  const customAllowanceAmountLessThanDepositAmount = !!(
    selectedAllowanceRadio === 'custom' &&
    allowanceAmount &&
    depositAmount &&
    allowanceAmount.lt(depositAmount)
  )

  const insufficientAllowance =
    token !== 'ETH' &&
    !!(depositAmount && !depositAmount.isZero() && (!allowance || depositAmount.gt(allowance)))

  const flowProgressionDisabled =
    inputAmountsEmpty ||
    isLoadingStage ||
    vaultWillBeUnderCollateralized ||
    vaultWillBeUnderCollateralizedAtNextPrice ||
    depositingAllEthBalance ||
    depositAmountExceedsCollateralBalance ||
    generateAmountExceedsDebtCeiling ||
    generateAmountLessThanDebtFloor ||
    customAllowanceAmountEmpty ||
    customAllowanceAmountExceedsMaxUint256 ||
    customAllowanceAmountLessThanDepositAmount

  return {
    ...state,
    ...categoriseOpenVaultStage(stage),

    inputAmountsEmpty,

    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,

    depositingAllEthBalance,
    depositAmountExceedsCollateralBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,

    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,

    isLoadingStage,
    flowProgressionDisabled,
  }
}
