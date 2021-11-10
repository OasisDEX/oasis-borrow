import { maxUint256 } from 'blockchain/calls/erc20'
import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
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

  customAllowanceAmountEmpty: boolean
  customAllowanceAmountExceedsMaxUint256: boolean
  customAllowanceAmountLessThanDepositAmount: boolean
  insufficientAllowance: boolean

  isLoadingStage: boolean
  canProgress: boolean
  canRegress: boolean
  isExchangeLoading: boolean
}

export const defaultGuniOpenMultiplyVaultConditions: GuniOpenMultiplyVaultConditions = {
  ...defaultOpenVaultStageCategories,
  inputAmountsEmpty: true,

  generateAmountLessThanDebtFloor: false,
  generateAmountMoreThanMaxFlashAmount: false,
  generateAmountExceedsDebtCeiling: false,

  customAllowanceAmountEmpty: false,
  customAllowanceAmountExceedsMaxUint256: false,
  customAllowanceAmountLessThanDepositAmount: false,
  insufficientAllowance: false,

  isLoadingStage: false,
  canProgress: false,
  canRegress: false,
  isExchangeLoading: false,
}

export function applyGuniOpenVaultConditions(state: OpenGuniVaultState): OpenGuniVaultState {
  const {
    stage,
    afterOutstandingDebt,

    ilkData,
    depositAmount,

    selectedAllowanceRadio,
    allowanceAmount,
    allowance,
    exchangeError,
    quote,
    swap,
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

  const customAllowanceAmountEmpty = selectedAllowanceRadio === 'custom' && !allowanceAmount

  const customAllowanceAmountExceedsMaxUint256 = !!(
    selectedAllowanceRadio === 'custom' && allowanceAmount?.gt(maxUint256)
  )

  const generateAmountExceedsDebtCeiling = !!afterOutstandingDebt?.gt(ilkData.ilkDebtAvailable)

  const customAllowanceAmountLessThanDepositAmount = !!(
    selectedAllowanceRadio === 'custom' &&
    allowanceAmount &&
    depositAmount &&
    allowanceAmount.lt(depositAmount)
  )

  const insufficientAllowance = !!(
    depositAmount &&
    !depositAmount.isZero() &&
    (!allowance || depositAmount.gt(allowance))
  )

  const isExchangeLoading = !quote && !swap && !exchangeError

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
      isExchangeLoading
    ) || stage === 'txSuccess'

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'allowanceWaitingForConfirmation',
    'allowanceFailure',
    'txWaitingForConfirmation',
    'txFailure',
  ] as Stage[]).some((s) => s === stage)

  return {
    ...state,
    inputAmountsEmpty,

    generateAmountLessThanDebtFloor,
    generateAmountMoreThanMaxFlashAmount,
    generateAmountExceedsDebtCeiling,

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
