import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { SLIPPAGE_WARNING_THRESHOLD } from 'features/userSettings/userSettings'
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
import { OpenMultiplyVaultStage, OpenMultiplyVaultState } from './openMultiplyVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isStopLossEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

export function applyOpenVaultStageCategorisation(state: OpenMultiplyVaultState) {
  const {
    stage,
    token,
    depositAmount,
    allowance,
    withProxyStep,
    withAllowanceStep,
    withStopLossStage,
    proxyAddress,
  } = state
  const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
  const depositAmountLessThanAllowance = allowance && depositAmount && allowance.gte(depositAmount)

  const hasAllowance = token === 'ETH' ? true : depositAmountLessThanAllowance || openingEmptyVault

  const totalSteps = getTotalStepsForOpenVaultFlow({
    token,
    proxyAddress,
    hasAllowance,
    withProxyStep,
    withAllowanceStep,
    withStopLossStep: withStopLossStage,
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
          : withStopLossStage
          ? totalSteps - (token === 'ETH' ? 2 : 3)
          : totalSteps - (token === 'ETH' ? 1 : 2),
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
        currentStep: withStopLossStage ? totalSteps - 2 : totalSteps - 1,
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

export interface OpenMultiplyVaultConditions {
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
  generateAmountMoreThanMaxFlashAmount: boolean
  ledgerWalletContractDataDisabled: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  isSuccessStage: boolean
  canProgress: boolean
  canRegress: boolean
  canAdjustRisk: boolean
  isExchangeLoading: boolean

  highSlippage: boolean

  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
  openFlowWithStopLoss: boolean
  isStopLossSuccessStage: boolean
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
  potentialGenerateAmountLessThanDebtFloor: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  generateAmountExceedsDaiYieldFromDepositingCollateral: false,
  generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountLessThanDebtFloor: false,
  generateAmountMoreThanMaxFlashAmount: false,
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  isSuccessStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,
  withProxyStep: false,
  withAllowanceStep: false,

  highSlippage: false,
  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
  openFlowWithStopLoss: false,
  isStopLossSuccessStage: false,
  isAddStopLossStage: false,
}

export function applyOpenVaultConditions(state: OpenMultiplyVaultState): OpenMultiplyVaultState {
  const {
    stage,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterOutstandingDebt,
    daiYieldFromDepositingCollateral,
    daiYieldFromDepositingCollateralAtNextPrice,

    ilkData: {
      liquidationRatio,
      collateralizationDangerThreshold,
      collateralizationWarningThreshold,
      debtFloor,
      ilkDebtAvailable,
    },
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
    slippage,
    txError,
    withStopLossStage,
    stopLossSkipped,
    stopLossLevel,
    isStopLossEditingStage,
  } = state

  const inputAmountsEmpty = !depositAmount

  const canAdjustRisk =
    depositAmount !== undefined &&
    maxCollRatio !== undefined &&
    depositAmount.gt(0) &&
    maxCollRatio.gt(liquidationRatio)

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

  const vaultWillBeUnderCollateralized =
    afterOutstandingDebt?.gt(zero) &&
    afterCollateralizationRatio.lt(liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !!(
      afterOutstandingDebt?.gt(zero) &&
      afterCollateralizationRatioAtNextPrice.lt(liquidationRatio) &&
      !afterCollateralizationRatioAtNextPrice.isZero()
    )

  const depositingAllEthBalance = depositingAllEthBalanceValidator({
    token,
    depositAmount,
    collateralBalance,
  })

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const generateAmountExceedsDaiYieldFromDepositingCollateral = !!afterOutstandingDebt?.gt(
    daiYieldFromDepositingCollateral,
  )

  const generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice =
    !generateAmountExceedsDaiYieldFromDepositingCollateral &&
    !!afterOutstandingDebt?.gt(daiYieldFromDepositingCollateralAtNextPrice)

  const generateAmountExceedsDebtCeiling = !!afterOutstandingDebt?.gt(ilkDebtAvailable)

  const generateAmountLessThanDebtFloor =
    afterOutstandingDebt && !afterOutstandingDebt.isZero() && afterOutstandingDebt.lt(debtFloor)

  const generateAmountMoreThanMaxFlashAmount = afterOutstandingDebt.gt(FLASH_MINT_LIMIT_PER_TX)

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'allowanceInProgress',
    'allowanceWaitingForApproval',
    'txInProgress',
    'txWaitingForApproval',
  ] as OpenMultiplyVaultStage[]).some((s) => s === stage)

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

  const potentialGenerateAmountLessThanDebtFloor =
    !isNullish(depositAmount) && afterOutstandingDebt.lt(debtFloor)

  const insufficientAllowance =
    token !== 'ETH' &&
    !!(depositAmount && !depositAmount.isZero() && (!allowance || depositAmount.gt(allowance)))

  const isExchangeLoading = !quote && !swap && !exchangeError

  const highSlippage = slippage.gt(SLIPPAGE_WARNING_THRESHOLD)

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
      generateAmountMoreThanMaxFlashAmount ||
      customAllowanceAmountEmpty ||
      customAllowanceAmountExceedsMaxUint256 ||
      customAllowanceAmountLessThanDepositAmount ||
      exchangeError ||
      isExchangeLoading
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
  ] as OpenMultiplyVaultStage[]).some((s) => s === stage)

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  const openFlowWithStopLoss = withStopLossStage && !stopLossSkipped && stopLossLevel.gt(zero)

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
    potentialGenerateAmountLessThanDebtFloor,

    depositingAllEthBalance,
    depositAmountExceedsCollateralBalance,
    generateAmountExceedsDaiYieldFromDepositingCollateral,
    generateAmountExceedsDaiYieldFromDepositingCollateralAtNextPrice,
    generateAmountExceedsDebtCeiling,
    generateAmountLessThanDebtFloor,
    generateAmountMoreThanMaxFlashAmount,
    ledgerWalletContractDataDisabled,

    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,

    isLoadingStage,
    isSuccessStage,
    canProgress,
    canRegress,
    isExchangeLoading,

    highSlippage,

    insufficientEthFundsForTx,
    openFlowWithStopLoss,
    isStopLossSuccessStage,
  }
}
