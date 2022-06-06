import BigNumber from 'bignumber.js'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import {
  customAllowanceAmountEmptyValidator,
  customAllowanceAmountExceedsMaxUint256Validator,
  customAllowanceAmountLessThanDepositAmountValidator,
  ethFundsForTxValidator,
  ledgerWalletContractDataDisabledValidator,
} from 'features/form/commonValidators'
import { SLIPPAGE_DEFAULT, SLIPPAGE_WARNING_THRESHOLD } from 'features/userSettings/userSettings'
import { isNullish } from 'helpers/functions'
import { GUNI_MAX_SLIPPAGE, GUNI_SLIPPAGE } from 'helpers/multiply/calculations'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import { OpenGuniVaultState, Stage } from './openGuniVault'

const defaultOpenVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isAllowanceStage: false,
  isOpenStage: false,
}

export function applyGuniOpenVaultStageCategorisation(state: OpenGuniVaultState) {
  const { stage, depositAmount, allowance } = state
  const openingEmptyVault = depositAmount ? depositAmount.eq(zero) : true
  const depositAmountLessThanAllowance = allowance && depositAmount && allowance.gte(depositAmount)

  const hasAllowance = depositAmountLessThanAllowance || openingEmptyVault

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
        currentStep: totalSteps - 2,
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

export interface GuniOpenMultiplyVaultConditions {
  isEditingStage: boolean
  isProxyStage: boolean
  isAllowanceStage: boolean
  isOpenStage: boolean

  inputAmountsEmpty: boolean

  generateAmountLessThanDebtFloor: boolean
  generateAmountMoreThanMaxFlashAmount: boolean
  generateAmountExceedsDebtCeiling: boolean
  depositAmountExceedsCollateralBalance: boolean
  ledgerWalletContractDataDisabled: boolean

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean

  isLoadingStage: boolean
  isSuccessStage: boolean
  canProgress: boolean
  canRegress: boolean
  isExchangeLoading: boolean

  highSlippage: boolean
  customSlippageOverridden: boolean
  customSlippage: BigNumber

  insufficientEthFundsForTx: boolean
}

export const defaultGuniOpenMultiplyVaultConditions: GuniOpenMultiplyVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,

  generateAmountLessThanDebtFloor: false,
  generateAmountMoreThanMaxFlashAmount: false,
  generateAmountExceedsDebtCeiling: false,
  depositAmountExceedsCollateralBalance: false,
  ledgerWalletContractDataDisabled: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,
  potentialGenerateAmountLessThanDebtFloor: false,

  isLoadingStage: false,
  isSuccessStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,

  highSlippage: false,
  customSlippageOverridden: false,
  customSlippage: SLIPPAGE_DEFAULT,

  insufficientEthFundsForTx: false,
}

export function applyGuniOpenVaultConditions(state: OpenGuniVaultState): OpenGuniVaultState {
  const {
    stage,
    afterOutstandingDebt,

    ilkData,
    depositAmount,
    balanceInfo: { daiBalance },

    selectedAllowanceRadio,
    allowanceAmount,
    allowance,
    exchangeError,
    quote,
    swap,
    txError,

    slippage,
    customSlippage,
  } = state

  const inputAmountsEmpty = !depositAmount

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
    'txInProgress',
    'txWaitingForApproval',
  ] as Stage[]).some((s) => s === stage)

  const isSuccessStage = stage === 'txSuccess'

  const customAllowanceAmountEmpty = customAllowanceAmountEmptyValidator({
    selectedAllowanceRadio,
    allowanceAmount,
  })

  const customAllowanceAmountExceedsMaxUint256 = customAllowanceAmountExceedsMaxUint256Validator({
    selectedAllowanceRadio,
    allowanceAmount,
  })

  const generateAmountExceedsDebtCeiling = !!afterOutstandingDebt?.gt(ilkData.ilkDebtAvailable)

  const customAllowanceAmountLessThanDepositAmount = customAllowanceAmountLessThanDepositAmountValidator(
    {
      selectedAllowanceRadio,
      allowanceAmount,
      depositAmount,
    },
  )

  const ledgerWalletContractDataDisabled = ledgerWalletContractDataDisabledValidator({ txError })

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(daiBalance)

  const insufficientAllowance = !!(
    depositAmount &&
    !depositAmount.isZero() &&
    (!allowance || depositAmount.gt(allowance))
  )

  const isExchangeLoading = !quote && !swap && !exchangeError

  const highSlippage = slippage.gt(SLIPPAGE_WARNING_THRESHOLD)

  const invalidSlippage = slippage.gt(GUNI_MAX_SLIPPAGE)

  const customSlippageOverridden = !customSlippage.eq(GUNI_SLIPPAGE)
  state.slippage = GUNI_SLIPPAGE

  const potentialGenerateAmountLessThanDebtFloor =
    !isNullish(depositAmount) && afterOutstandingDebt.lt(ilkData.debtFloor)

  const canProgress =
    !(
      inputAmountsEmpty ||
      isLoadingStage ||
      generateAmountLessThanDebtFloor ||
      generateAmountMoreThanMaxFlashAmount ||
      customAllowanceAmountEmpty ||
      customAllowanceAmountExceedsMaxUint256 ||
      customAllowanceAmountLessThanDepositAmount ||
      exchangeError ||
      isExchangeLoading ||
      invalidSlippage
    ) || stage === 'txSuccess'

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'allowanceWaitingForConfirmation',
    'allowanceFailure',
    'txWaitingForConfirmation',
    'txFailure',
  ] as Stage[]).some((s) => s === stage)

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  return {
    ...state,
    inputAmountsEmpty,

    generateAmountLessThanDebtFloor,
    generateAmountMoreThanMaxFlashAmount,
    generateAmountExceedsDebtCeiling,
    depositAmountExceedsCollateralBalance,
    ledgerWalletContractDataDisabled,

    customAllowanceAmountEmpty,
    customAllowanceAmountExceedsMaxUint256,
    customAllowanceAmountLessThanDepositAmount,
    insufficientAllowance,
    potentialGenerateAmountLessThanDebtFloor,

    isLoadingStage,
    isSuccessStage,
    canProgress,
    canRegress,
    isExchangeLoading,

    highSlippage,
    invalidSlippage,
    customSlippageOverridden,

    insufficientEthFundsForTx,
  }
}
