import BigNumber from 'bignumber.js'
import { isNullish } from 'helpers/functions'
import { getTotalStepsForOpenVaultFlow } from 'helpers/totalSteps'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import {
  customAllowanceAmountEmptyValidator,
  customAllowanceAmountExceedsMaxUint256Validator,
  customAllowanceAmountLessThanDepositAmountValidator,
  depositingAllEthBalanceValidator,
  ethFundsForTxValidator,
  ledgerWalletContractDataDisabledValidator,
  vaultWillBeAtRiskLevelDangerAtNextPriceValidator,
  vaultWillBeAtRiskLevelDangerValidator,
  vaultWillBeAtRiskLevelWarningAtNextPriceValidator,
  vaultWillBeAtRiskLevelWarningValidator,
} from '../../../form/commonValidators'
import { OpenVaultStage, OpenVaultState } from './openVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isStopLossEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
  isAddStopLossStage: false,
}

export function calculateInitialTotalSteps(
  proxyAddress: string | undefined,
  token: string,
  allowance: BigNumber | undefined | 'skip',
) {
  let totalSteps = 2

  if (!proxyAddress) {
    totalSteps += 1
  }

  if (allowance !== 'skip') {
    if (token !== 'ETH' && (!allowance || allowance.lte(zero))) {
      totalSteps += 1
    }
  }

  return totalSteps
}

export function applyOpenVaultStageCategorisation(state: OpenVaultState) {
  const {
    stage,
    token,
    depositAmount,
    allowance,
    generateAmount,
    withStopLossStage,
    proxyAddress,
    withProxyStep,
    withAllowanceStep,
  } = state
  const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
  const depositAmountLessThanAllowance = allowance && depositAmount && allowance.gte(depositAmount)

  const hasAllowance = token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault
  const withStopLossStep = !!(withStopLossStage && generateAmount?.gt(zero))

  const totalSteps = getTotalStepsForOpenVaultFlow({
    token,
    proxyAddress,
    hasAllowance,
    withProxyStep,
    withAllowanceStep,
    withStopLossStep,
    openingEmptyVault,
  })

  switch (stage) {
    case 'editing':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isEditingStage: true,
        totalSteps,
        currentStep: withProxyStep ? 3 : withAllowanceStep ? 2 : 1,
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
        currentStep: openingEmptyVault
          ? totalSteps - 1
          : withStopLossStep
          ? totalSteps - (token === 'ETH' ? 2 : 3)
          : totalSteps - (token === 'ETH' ? 1 : 2),
        proxyAddress,
        withProxyStep: true,
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
        currentStep: withStopLossStep ? totalSteps - 2 : totalSteps - 1,
        withAllowanceStep: true,
      }
    case 'stopLossEditing':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isStopLossEditingStage: true,
        totalSteps,
        currentStep: totalSteps - 1,
      }
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txInProgress':
    case 'txFailure':
    case 'txSuccess':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isOpenStage: true,
        totalSteps,
        currentStep: totalSteps,
      }
    case 'stopLossTxWaitingForConfirmation':
    case 'stopLossTxWaitingForApproval':
    case 'stopLossTxInProgress':
    case 'stopLossTxFailure':
    case 'stopLossTxSuccess':
      return {
        ...state,
        ...defaultOpenVaultStageCategories,
        isAddStopLossStage: true,
        totalSteps,
        currentStep: totalSteps,
      }
    default:
      throw new UnreachableCaseError(stage)
  }
}

export interface OpenVaultConditions {
  isEditingStage: boolean
  isStopLossEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean
  isAddStopLossStage: boolean
  withProxyStep: boolean
  withAllowanceStep: boolean

  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateral: boolean
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: boolean
  generateAmountExceedsDebtCeiling: boolean
  generateAmountLessThanDebtFloor: boolean
  ledgerWalletContractDataDisabled: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  isSuccessStage: boolean
  isStopLossSuccessStage: boolean
  openFlowWithStopLoss: boolean
  canProgress: boolean
  canRegress: boolean

  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
  stopLossOnNearLiquidationRatio: boolean
  stopLossHigherThanCurrentOrNext: boolean
  currentCollRatioCloseToStopLoss: boolean
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
  potentialGenerateAmountLessThanDebtFloor: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  generateAmountExceedsDaiYieldFromDepositingCollateral: false,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountLessThanDebtFloor: false,
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  isSuccessStage: false,
  isStopLossSuccessStage: false,
  openFlowWithStopLoss: false,
  canProgress: false,
  canRegress: false,
  withProxyStep: false,
  withAllowanceStep: false,

  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
  stopLossOnNearLiquidationRatio: false,
  stopLossHigherThanCurrentOrNext: false,
  currentCollRatioCloseToStopLoss: false,
}

export function applyOpenVaultConditions(state: OpenVaultState): OpenVaultState {
  const {
    stage,
    generateAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    ilkData: {
      liquidationRatio,
      collateralizationDangerThreshold,
      collateralizationWarningThreshold,
      ilkDebtAvailable,
      debtFloor,
    },
    token,
    balanceInfo: { collateralBalance },
    depositAmount,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,
    selectedAllowanceRadio,
    allowanceAmount,
    allowance,
    txError,
    withStopLossStage,
    stopLossLevel,
    stopLossSkipped,
    isStopLossEditingStage,
  } = state

  const inputAmountsEmpty = !depositAmount && !generateAmount

  const vaultWillBeAtRiskLevelDanger = vaultWillBeAtRiskLevelDangerValidator({
    inputAmountsEmpty,
    afterCollateralizationRatio,
    liquidationRatio,
    collateralizationDangerThreshold,
  })

  const vaultWillBeAtRiskLevelDangerAtNextPrice = vaultWillBeAtRiskLevelDangerAtNextPriceValidator({
    vaultWillBeAtRiskLevelDanger,
    inputAmountsEmpty,
    afterCollateralizationRatioAtNextPrice,
    liquidationRatio,
    collateralizationDangerThreshold,
  })

  const vaultWillBeAtRiskLevelWarning = vaultWillBeAtRiskLevelWarningValidator({
    inputAmountsEmpty,
    afterCollateralizationRatio,
    collateralizationDangerThreshold,
    collateralizationWarningThreshold,
  })

  const vaultWillBeAtRiskLevelWarningAtNextPrice = vaultWillBeAtRiskLevelWarningAtNextPriceValidator(
    {
      vaultWillBeAtRiskLevelWarning,
      inputAmountsEmpty,
      afterCollateralizationRatioAtNextPrice,
      collateralizationDangerThreshold,
      collateralizationWarningThreshold,
    },
  )

  const vaultWillBeUnderCollateralized = !!(
    generateAmount?.gt(zero) &&
    afterCollateralizationRatio.lt(liquidationRatio) &&
    !afterCollateralizationRatio.isZero()
  )

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !!(
      generateAmount?.gt(zero) &&
      afterCollateralizationRatioAtNextPrice.lt(liquidationRatio) &&
      !afterCollateralizationRatioAtNextPrice.isZero()
    )

  const depositingAllEthBalance = depositingAllEthBalanceValidator({
    token,
    depositAmount,
    collateralBalance,
  })

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const generateAmountExceedsDaiYieldFromDepositingCollateral = !!generateAmount?.gt(
    daiYieldFromDepositingCollateral,
  )

  const generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromDepositingCollateral &&
    !!generateAmount?.gt(daiYieldFromDepositingCollateralAtNextPrice)

  const generateAmountExceedsDebtCeiling = !!generateAmount?.gt(ilkDebtAvailable)

  const generateAmountLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.isZero() &&
    generateAmount.lt(debtFloor)
  )

  const potentialGenerateAmountLessThanDebtFloor =
    !isNullish(depositAmount) && daiYieldFromDepositingCollateral.lt(debtFloor)

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'txInProgress',
    'txWaitingForApproval',
    'stopLossTxInProgress',
    'stopLossTxWaitingForApproval',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const isSuccessStage = stage === 'txSuccess'
  const isStopLossSuccessStage = stage === 'stopLossTxSuccess'

  const customAllowanceAmountEmpty = customAllowanceAmountEmptyValidator({
    selectedAllowanceRadio,
    allowanceAmount,
  })

  const customAllowanceAmountExceedsMaxUint256 = customAllowanceAmountExceedsMaxUint256Validator({
    selectedAllowanceRadio,
    allowanceAmount,
  })

  const customAllowanceAmountLessThanDepositAmount = customAllowanceAmountLessThanDepositAmountValidator(
    {
      selectedAllowanceRadio,
      allowanceAmount,
      depositAmount,
    },
  )

  const ledgerWalletContractDataDisabled = ledgerWalletContractDataDisabledValidator({ txError })

  const insufficientAllowance =
    token !== 'ETH' &&
    !!(depositAmount && !depositAmount.isZero() && (!allowance || depositAmount.gt(allowance)))

  const stopLossNotAdjusted = isStopLossEditingStage && stopLossLevel.isZero()

  const canProgress =
    !(
      inputAmountsEmpty ||
      isLoadingStage ||
      stopLossNotAdjusted ||
      vaultWillBeUnderCollateralized ||
      vaultWillBeUnderCollateralizedAtNextPrice ||
      depositingAllEthBalance ||
      depositAmountExceedsCollateralBalance ||
      generateAmountExceedsDebtCeiling ||
      generateAmountLessThanDebtFloor ||
      customAllowanceAmountEmpty ||
      customAllowanceAmountExceedsMaxUint256 ||
      customAllowanceAmountLessThanDepositAmount
    ) ||
    stage === 'txSuccess' ||
    stage === 'stopLossTxWaitingForConfirmation' ||
    stage === 'stopLossTxSuccess'

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'allowanceWaitingForConfirmation',
    'allowanceFailure',
    'stopLossEditing',
    'txWaitingForConfirmation',
    'txFailure',
  ] as OpenVaultStage[]).some((s) => s === stage)

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  const openFlowWithStopLoss = withStopLossStage && !stopLossSkipped && stopLossLevel.gt(zero)

  return {
    ...state,
    inputAmountsEmpty,

    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,
    potentialGenerateAmountLessThanDebtFloor,
    insufficientEthFundsForTx,

    depositingAllEthBalance,
    depositAmountExceedsCollateralBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,
    ledgerWalletContractDataDisabled,

    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,

    isLoadingStage,
    isSuccessStage,
    isStopLossSuccessStage,
    openFlowWithStopLoss,
    canProgress,
    canRegress,
  }
}
