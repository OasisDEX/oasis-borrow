
import { maxUint256 } from 'blockchain/calls/erc20'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import { OpenMultiplyVaultStage, OpenMultiplyVaultState } from './openMultiplyVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

export function applyOpenVaultStageCategorisation(state: OpenMultiplyVaultState) {
  const { stage, token, depositAmount, allowance } = state
  const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
  const depositAmountLessThanAllowance = allowance && depositAmount && allowance.gte(depositAmount)

  const hasAllowance = token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

  const totalSteps = !hasAllowance && state.totalSteps < 3 ? state.totalSteps + 1 : state.totalSteps

  switch (stage) {
    case 'editing':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isEditingStage: true,
        totalSteps,
        currentStep: 1,
      }
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'proxyFailure':
    case 'proxySuccess':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isProxyStage: true,
        totalSteps,
        currentStep: totalSteps - (token === 'ETH' ? 1 : 2),
      }
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isAllowanceStage: true,
        totalSteps,
        currentStep: totalSteps - 1,
      }
    case 'openWaitingForConfirmation':
    case 'openWaitingForApproval':
    case 'openInProgress':
    case 'openFailure':
    case 'openSuccess':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isOpenStage: true,
        totalSteps,
        currentStep: totalSteps,
      }
    default:
      throw new UnreachableCaseError(stage)
  }
}

export interface OpenMultiplyVaultConditions {
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
  generateAmountMoreThanMaxFlashAmount: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  canProgress: boolean
  canRegress: boolean
  canAdjustRisk: boolean
  isExchangeLoading: boolean
}

export const defaultOpenMultiplyVaultConditions: OpenMultiplyVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,
  canAdjustRisk: false,

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
  generateAmountMoreThanMaxFlashAmount: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,
}

export function applyOpenVaultConditions(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    stage,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterOutstandingDebt,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,

    ilkData,
    token,
    balanceInfo: { collateralBalance },
    depositAmount,

    selectedAllowanceRadio,
    allowanceAmount,
    allowance,
    maxCollRatio,
    exchangeError,
    quote,
    swap,
  } = state

  const inputAmountsEmpty = !depositAmount
  const canAdjustRisk =
    depositAmount !== undefined &&
    maxCollRatio !== undefined &&
    depositAmount.gt(0) &&
    maxCollRatio.gt(ilkData.liquidationRatio)

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
    afterOutstandingDebt?.gt(zero) &&
    afterCollateralizationRatio.lt(ilkData.liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !!(
      afterOutstandingDebt?.gt(zero) &&
      afterCollateralizationRatioAtNextPrice.lt(ilkData.liquidationRatio) &&
      !afterCollateralizationRatioAtNextPrice.isZero()
    )

  const depositingAllEthBalance = token === 'ETH' && !!depositAmount?.eq(collateralBalance)
  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const generateAmountExceedsDaiYieldFromDepositingCollateral = !!afterOutstandingDebt?.gt(
    daiYieldFromDepositingCollateral,
  )

  const generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromDepositingCollateral &&
    !!afterOutstandingDebt?.gt(daiYieldFromDepositingCollateralAtNextPrice)

  const generateAmountExceedsDebtCeiling = !!afterOutstandingDebt?.gt(ilkData.ilkDebtAvailable)

  const generateAmountLessThanDebtFloor =
    afterOutstandingDebt &&
    !afterOutstandingDebt.isZero() &&
    afterOutstandingDebt.lt(ilkData.debtFloor)

  const generateAmountMoreThanMaxFlashAmount = afterOutstandingDebt.gt(FLASH_MINT_LIMIT_PER_TX)

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'openInProgress',
    'openWaitingForApproval',
  ] as OpenMultiplyVaultStage[]).some((s) => s === stage)

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

  const isExchangeLoading = !quote && !swap && !exchangeError

  const canProgress =
    !(
      inputAmountsEmpty ||
      isLoadingStage ||
      vaultWillBeUnderCollateralized ||
      vaultWillBeUnderCollateralizedAtNextPrice ||
      depositingAllEthBalance ||
      depositAmountExceedsCollateralBalance ||
      generateAmountExceedsDebtCeiling ||
      generateAmountLessThanDebtFloor ||
      generateAmountMoreThanMaxFlashAmount ||
      customAllowanceAmountEmpty ||
      customAllowanceAmountExceedsMaxUint256 ||
      customAllowanceAmountLessThanDepositAmount ||
      exchangeError ||
      isExchangeLoading
    ) || stage === 'openSuccess'

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'allowanceWaitingForConfirmation',
    'allowanceFailure',
    'openWaitingForConfirmation',
    'openFailure',
  ] as OpenMultiplyVaultStage[]).some((s) => s === stage)

  return {
    ...state,
    inputAmountsEmpty,
    canAdjustRisk,

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
    generateAmountMoreThanMaxFlashAmount,

    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,

    isLoadingStage,
    canProgress,
    canRegress,
    isExchangeLoading,
  }
}
