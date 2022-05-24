import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { SLIPPAGE_WARNING_THRESHOLD } from 'features/userSettings/userSettings'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import { isNullish } from '../../../../helpers/functions'
import {
  customAllowanceAmountEmptyValidator,
  customAllowanceAmountExceedsMaxUint256Validator,
  customAllowanceAmountLessThanDepositAmountValidator,
  depositingAllEthBalanceValidator,
  ledgerWalletContractDataDisabledValidator,
  vaultWillBeAtRiskLevelDangerAtNextPriceValidator,
  vaultWillBeAtRiskLevelDangerValidator,
  vaultWillBeAtRiskLevelWarningAtNextPriceValidator,
  vaultWillBeAtRiskLevelWarningValidator,
} from '../../../form/commonValidators'
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

  highSlippage: false,
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
    ) || stage === 'txSuccess'

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'allowanceWaitingForConfirmation',
    'allowanceFailure',
    'txWaitingForConfirmation',
    'txFailure',
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
  }
}
