import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import { SLIPPAGE_WARNING_THRESHOLD } from 'features/userSettings/userSettings'
import { isNullish } from 'helpers/functions'
import { STOP_LOSS_MARGIN } from 'helpers/multiply/calculations'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

import {
  accountIsConnectedValidator,
  accountIsControllerValidator,
  afterCollRatioThresholdRatioValidator,
  collateralAllowanceProgressionDisabledValidator,
  customCollateralAllowanceAmountEmptyValidator,
  customCollateralAllowanceAmountExceedsMaxUint256Validator,
  customCollateralAllowanceAmountLessThanDepositAmountValidator,
  customDaiAllowanceAmountEmptyValidator,
  customDaiAllowanceAmountExceedsMaxUint256Validator,
  customDaiAllowanceAmountLessThanPaybackAmountValidator,
  daiAllowanceProgressionDisabledValidator,
  debtIsLessThanDebtFloorValidator,
  depositAndWithdrawAmountsEmptyValidator,
  depositingAllEthBalanceValidator,
  ethFundsForTxValidator,
  generateAndPaybackAmountsEmptyValidator,
  insufficientCollateralAllowanceValidator,
  insufficientDaiAllowanceValidator,
  ledgerWalletContractDataDisabledValidator,
  paybackAmountExceedsDaiBalanceValidator,
  paybackAmountExceedsVaultDebtValidator,
  stopLossTriggeredValidator,
  vaultWillBeAtRiskLevelDangerAtNextPriceValidator,
  vaultWillBeAtRiskLevelDangerValidator,
  vaultWillBeAtRiskLevelWarningAtNextPriceValidator,
  vaultWillBeAtRiskLevelWarningValidator,
  withdrawAmountExceedsFreeCollateralAtNextPriceValidator,
  withdrawAmountExceedsFreeCollateralValidator,
  withdrawCollateralOnVaultUnderDebtFloorValidator,
} from '../../../form/commonValidators'
import { ManageMultiplyVaultStage, ManageMultiplyVaultState } from './manageMultiplyVault'

const defaultManageVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
  isBorrowTransitionStage: false,
}

export function applyManageVaultStageCategorisation<VS extends ManageMultiplyVaultState>(
  state: VS,
): VS {
  const {
    stage,
    vault: { token, debtOffset },
    depositAmount,
    depositDaiAmount,
    daiAllowance,
    collateralAllowance,
    paybackAmount,
    initialTotalSteps,
  } = state

  const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
  const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true
  const isDepositDaiZero = depositDaiAmount ? depositDaiAmount.eq(zero) : true

  const depositAmountLessThanCollateralAllowance =
    collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)

  const paybackAmountLessThanDaiAllowance =
    daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))

  const depositDaiAmountLessThanDaiAllowance =
    daiAllowance && depositDaiAmount && daiAllowance.gte(depositDaiAmount.plus(debtOffset))

  const hasCollateralAllowance =
    token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

  const hasDaiAllowance =
    (paybackAmountLessThanDaiAllowance || isPaybackZero) &&
    (depositDaiAmountLessThanDaiAllowance || isDepositDaiZero)

  let totalSteps = initialTotalSteps

  if (initialTotalSteps === 2 && (!hasCollateralAllowance || !hasDaiAllowance)) {
    totalSteps = 3
  }

  if (initialTotalSteps === 3 && hasCollateralAllowance && hasDaiAllowance && !isPaybackZero) {
    totalSteps = 2
  }

  switch (stage) {
    case 'adjustPosition':
    case 'otherActions':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
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
        ...defaultManageVaultStageCategories,
        isProxyStage: true,
        totalSteps,
        currentStep: totalSteps - (token === 'ETH' ? 1 : 2),
      }
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
        isCollateralAllowanceStage: true,
        totalSteps,
        currentStep: totalSteps - 1,
      }
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
        isDaiAllowanceStage: true,
        totalSteps,
        currentStep: totalSteps - 1,
      }

    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageInProgress':
    case 'manageFailure':
    case 'manageSuccess':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
        isManageStage: true,
        totalSteps,
        currentStep: totalSteps,
      }
    case 'borrowTransitionEditing':
    case 'borrowTransitionWaitingForConfirmation':
    case 'borrowTransitionInProgress':
    case 'borrowTransitionFailure':
    case 'borrowTransitionSuccess':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
        isBorrowTransitionStage: true,
        totalSteps: 2,
        currentStep: stage === 'borrowTransitionEditing' ? 1 : 2,
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
  isBorrowTransitionStage: boolean

  canProgress: boolean
  canRegress: boolean

  depositAndWithdrawAmountsEmpty: boolean
  generateAndPaybackAmountsEmpty: boolean
  inputAmountsEmpty: boolean

  vaultWillBeAtRiskLevelWarning: boolean
  vaultWillBeAtRiskLevelDanger: boolean
  vaultWillBeUnderCollateralized: boolean

  vaultWillBeAtRiskLevelWarningAtNextPrice: boolean
  vaultWillBeAtRiskLevelDangerAtNextPrice: boolean
  vaultWillBeUnderCollateralizedAtNextPrice: boolean
  potentialGenerateAmountLessThanDebtFloor: boolean
  debtIsLessThanDebtFloor: boolean

  accountIsConnected: boolean
  accountIsController: boolean

  depositingAllEthBalance: boolean
  depositAmountExceedsCollateralBalance: boolean
  depositDaiAmountExceedsDaiBalance: boolean
  withdrawAmountExceedsFreeCollateral: boolean
  withdrawAmountExceedsFreeCollateralAtNextPrice: boolean
  generateAmountExceedsDaiYieldFromTotalCollateral: boolean
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: boolean
  generateAmountLessThanDebtFloor: boolean
  generateAmountExceedsDebtCeiling: boolean
  paybackAmountExceedsVaultDebt: boolean
  paybackAmountExceedsDaiBalance: boolean
  generateAmountMoreThanMaxFlashAmount: boolean
  debtWillBeLessThanDebtFloor: boolean
  isLoadingStage: boolean
  isSuccessStage: boolean
  exchangeDataRequired: boolean
  shouldShowExchangeError: boolean
  isExchangeLoading: boolean

  insufficientCollateralAllowance: boolean
  customCollateralAllowanceAmountEmpty: boolean
  customCollateralAllowanceAmountExceedsMaxUint256: boolean
  customCollateralAllowanceAmountLessThanDepositAmount: boolean
  ledgerWalletContractDataDisabled: boolean

  insufficientDaiAllowance: boolean
  customDaiAllowanceAmountEmpty: boolean
  customDaiAllowanceAmountExceedsMaxUint256: boolean
  customDaiAllowanceAmountLessThanPaybackAmount: boolean
  withdrawCollateralOnVaultUnderDebtFloor: boolean

  hasToDepositCollateralOnEmptyVault: boolean

  highSlippage: boolean
  invalidSlippage: boolean
  stopLossTriggered: boolean
  afterCollRatioBelowStopLossRatio: boolean
  afterCollRatioBelowBasicSellRatio: boolean
  afterCollRatioAboveBasicBuyRatio: boolean
  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
}

export const defaultManageMultiplyVaultConditions: ManageVaultConditions = {
  ...defaultManageVaultStageCategories,
  canProgress: false,
  canRegress: false,

  vaultWillBeAtRiskLevelWarning: false,
  vaultWillBeAtRiskLevelDanger: false,
  vaultWillBeUnderCollateralized: false,

  vaultWillBeAtRiskLevelWarningAtNextPrice: false,
  vaultWillBeAtRiskLevelDangerAtNextPrice: false,
  vaultWillBeUnderCollateralizedAtNextPrice: false,
  potentialGenerateAmountLessThanDebtFloor: false,
  debtIsLessThanDebtFloor: false,

  depositAndWithdrawAmountsEmpty: true,
  generateAndPaybackAmountsEmpty: true,
  inputAmountsEmpty: true,

  accountIsConnected: false,
  accountIsController: false,

  depositingAllEthBalance: false,
  depositAmountExceedsCollateralBalance: false,
  depositDaiAmountExceedsDaiBalance: false,
  withdrawAmountExceedsFreeCollateral: false,
  withdrawAmountExceedsFreeCollateralAtNextPrice: false,
  generateAmountExceedsDaiYieldFromTotalCollateral: false,
  generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice: false,
  generateAmountLessThanDebtFloor: false,
  generateAmountExceedsDebtCeiling: false,
  generateAmountMoreThanMaxFlashAmount: false,
  paybackAmountExceedsVaultDebt: false,
  paybackAmountExceedsDaiBalance: false,

  debtWillBeLessThanDebtFloor: false,
  isLoadingStage: false,
  isSuccessStage: false,
  exchangeDataRequired: false,
  shouldShowExchangeError: false,
  isExchangeLoading: false,

  insufficientCollateralAllowance: false,
  customCollateralAllowanceAmountEmpty: false,
  customCollateralAllowanceAmountExceedsMaxUint256: false,
  customCollateralAllowanceAmountLessThanDepositAmount: false,
  ledgerWalletContractDataDisabled: false,

  insufficientDaiAllowance: false,
  customDaiAllowanceAmountEmpty: false,
  customDaiAllowanceAmountExceedsMaxUint256: false,
  customDaiAllowanceAmountLessThanPaybackAmount: false,

  withdrawCollateralOnVaultUnderDebtFloor: false,

  hasToDepositCollateralOnEmptyVault: false,

  highSlippage: false,
  invalidSlippage: false,
  stopLossTriggered: false,
  afterCollRatioBelowStopLossRatio: false,
  afterCollRatioBelowBasicSellRatio: false,
  afterCollRatioAboveBasicBuyRatio: false,

  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
}

export function applyManageVaultConditions<VS extends ManageMultiplyVaultState>(state: VS): VS {
  const {
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
    afterDebt,
    debtDelta,
    ilkData: {
      liquidationRatio,
      collateralizationDangerThreshold,
      collateralizationWarningThreshold,
      debtFloor,
      ilkDebtAvailable,
    },
    vault: { controller, debt, token, debtOffset, lockedCollateral },
    account,
    stage,
    selectedCollateralAllowanceRadio,
    selectedDaiAllowanceRadio,
    collateralAllowanceAmount,
    daiAllowanceAmount,
    collateralAllowance,
    daiAllowance,
    shouldPaybackAll,
    balanceInfo: { collateralBalance, daiBalance },
    isEditingStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    isBorrowTransitionStage,

    buyAmount,
    sellAmount,
    paybackAmount,
    depositAmount,
    depositDaiAmount,
    generateAmount,
    withdrawAmount,
    requiredCollRatio,

    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
    maxGenerateAmountAtCurrentPrice,
    maxGenerateAmountAtNextPrice,

    quote,
    swap,
    exchangeError,
    otherAction,
    originalEditingStage,
    slippage,
    txError,

    invalidSlippage,
    vaultHistory,
    stopLossData,
    basicSellData,
    basicBuyData,
  } = state

  const depositAndWithdrawAmountsEmpty = depositAndWithdrawAmountsEmptyValidator({
    depositAmount,
    withdrawAmount,
  })

  const generateAndPaybackAmountsEmpty = generateAndPaybackAmountsEmptyValidator({
    generateAmount,
    paybackAmount,
  })

  const hasToDepositCollateralOnEmptyVault =
    lockedCollateral.eq(zero) &&
    !(
      originalEditingStage === 'otherActions' &&
      (otherAction === 'depositCollateral' || otherAction === 'depositDai')
    )

  const isDepositAction = otherAction === 'depositCollateral' || otherAction === 'depositDai'
  const isWithdrawAction = otherAction === 'withdrawCollateral' || otherAction === 'withdrawDai'
  const isDepositOrWithdrawAndMultiply =
    (isDepositAction || isWithdrawAction) && !!requiredCollRatio?.gt(zero)

  const exchangeDataRequired =
    originalEditingStage === 'adjustPosition' ||
    (originalEditingStage === 'otherActions' &&
      ((otherAction === 'closeVault' && !debt.isZero()) || isDepositOrWithdrawAndMultiply))

  const shouldShowExchangeError = exchangeDataRequired && exchangeError

  const isExchangeLoading = exchangeDataRequired && !quote && !swap && !exchangeError

  const inputAmountsEmpty =
    buyAmount === undefined &&
    sellAmount === undefined &&
    paybackAmount === undefined &&
    depositAmount === undefined &&
    generateAmount === undefined &&
    withdrawAmount === undefined &&
    requiredCollRatio === undefined &&
    (otherAction !== 'closeVault' || originalEditingStage === 'adjustPosition')

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
    afterDebt.gt(zero) &&
    afterCollateralizationRatio.lt(liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    afterDebt.gt(zero) &&
    afterCollateralizationRatioAtNextPrice.lt(liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsControllerValidator({
    accountIsConnected,
    account,
    controller,
  })

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)
  const depositDaiAmountExceedsDaiBalance = !!depositDaiAmount?.gt(daiBalance)

  const depositingAllEthBalance = depositingAllEthBalanceValidator({
    token,
    depositAmount,
    collateralBalance,
  })

  const withdrawAmountExceedsFreeCollateral = withdrawAmountExceedsFreeCollateralValidator({
    withdrawAmount,
    maxWithdrawAmountAtCurrentPrice,
  })

  const withdrawAmountExceedsFreeCollateralAtNextPrice = withdrawAmountExceedsFreeCollateralAtNextPriceValidator(
    { withdrawAmount, withdrawAmountExceedsFreeCollateral, maxWithdrawAmountAtNextPrice },
  )

  // generate amount used for calc, can be from input for Other Actions or from afterDebt for Adjust Position
  const generateAmountCalc = afterDebt.gt(debt) ? afterDebt.minus(debt) : zero
  const paybackAmountCalc = afterDebt.lt(debt) ? debt.minus(afterDebt) : zero

  const generateAmountExceedsDebtCeiling = !!generateAmountCalc?.gt(ilkDebtAvailable)

  const generateAmountExceedsDaiYieldFromTotalCollateral =
    !generateAmountExceedsDebtCeiling && !!generateAmountCalc.gt(maxGenerateAmountAtCurrentPrice)

  const generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice =
    !generateAmountExceedsDebtCeiling &&
    !generateAmountExceedsDaiYieldFromTotalCollateral &&
    !!generateAmountCalc.gt(maxGenerateAmountAtNextPrice)

  const generateAmountLessThanDebtFloor =
    generateAmountCalc.gt(zero) &&
    !(debt.plus(generateAmountCalc).isZero() || debt.plus(generateAmountCalc).gte(debtFloor))

  const generateAmountMoreThanMaxFlashAmount = debtDelta
    ? debtDelta?.gt(FLASH_MINT_LIMIT_PER_TX)
    : false

  const paybackAmountExceedsDaiBalance = paybackAmountExceedsDaiBalanceValidator({
    paybackAmount,
    daiBalance,
  })

  const paybackAmountExceedsVaultDebt = paybackAmountExceedsVaultDebtValidator({
    paybackAmount,
    debt,
  })

  const debtWillBeLessThanDebtFloor =
    !paybackAmountExceedsVaultDebt &&
    paybackAmountCalc.gt(zero) &&
    !(debt.minus(paybackAmountCalc).isZero() || debt.minus(paybackAmountCalc).gte(debtFloor))

  const customCollateralAllowanceAmountEmpty = customCollateralAllowanceAmountEmptyValidator({
    selectedCollateralAllowanceRadio,
    collateralAllowanceAmount,
  })

  const customDaiAllowanceAmountEmpty = customDaiAllowanceAmountEmptyValidator({
    selectedDaiAllowanceRadio,
    daiAllowanceAmount,
  })

  const customCollateralAllowanceAmountExceedsMaxUint256 = customCollateralAllowanceAmountExceedsMaxUint256Validator(
    { selectedCollateralAllowanceRadio, collateralAllowanceAmount },
  )

  const customCollateralAllowanceAmountLessThanDepositAmount = customCollateralAllowanceAmountLessThanDepositAmountValidator(
    { selectedCollateralAllowanceRadio, collateralAllowanceAmount, depositAmount },
  )

  const customDaiAllowanceAmountExceedsMaxUint256 = customDaiAllowanceAmountExceedsMaxUint256Validator(
    { selectedDaiAllowanceRadio, daiAllowanceAmount },
  )

  const customDaiAllowanceAmountLessThanPaybackAmount = customDaiAllowanceAmountLessThanPaybackAmountValidator(
    { selectedDaiAllowanceRadio, daiAllowanceAmount, paybackAmount },
  )

  const insufficientCollateralAllowance = insufficientCollateralAllowanceValidator({
    token,
    depositAmount,
    collateralAllowance,
  })

  const ledgerWalletContractDataDisabled = ledgerWalletContractDataDisabledValidator({ txError })

  const insufficientDaiAllowance = insufficientDaiAllowanceValidator({
    paybackAmount,
    depositDaiAmount,
    daiAllowance,
    debtOffset,
  })

  const isLoadingStage = ([
    'proxyInProgress',
    'proxyWaitingForApproval',
    'collateralAllowanceWaitingForApproval',
    'collateralAllowanceInProgress',
    'daiAllowanceWaitingForApproval',
    'daiAllowanceInProgress',
    'manageInProgress',
    'manageWaitingForApproval',
    'borrowTransitionInProgress',
    'borrowTransitionSuccess',
  ] as ManageMultiplyVaultStage[]).some((s) => s === stage)

  const isSuccessStage = stage === 'manageSuccess'

  const withdrawCollateralOnVaultUnderDebtFloor = withdrawCollateralOnVaultUnderDebtFloorValidator({
    debtFloor,
    debt,
    withdrawAmount,
    paybackAmount,
  })

  const highSlippage = exchangeDataRequired && slippage.gt(SLIPPAGE_WARNING_THRESHOLD)

  const afterCollRatioBelowStopLossRatio =
    !!stopLossData?.isStopLossEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: stopLossData.stopLossLevel,
      type: 'below',
      margin: STOP_LOSS_MARGIN,
    })

  const afterCollRatioBelowBasicSellRatio =
    !!basicSellData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: basicSellData.execCollRatio.div(100),
      type: 'below',
    })

  const afterCollRatioAboveBasicBuyRatio =
    !!basicBuyData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: basicBuyData.execCollRatio.div(100),
      type: 'above',
    })

  const editingProgressionDisabled =
    isEditingStage &&
    (inputAmountsEmpty ||
      !controller ||
      !accountIsConnected ||
      vaultWillBeUnderCollateralized ||
      vaultWillBeUnderCollateralizedAtNextPrice ||
      debtWillBeLessThanDebtFloor ||
      depositAmountExceedsCollateralBalance ||
      depositDaiAmountExceedsDaiBalance ||
      withdrawAmountExceedsFreeCollateral ||
      withdrawAmountExceedsFreeCollateralAtNextPrice ||
      depositingAllEthBalance ||
      generateAmountExceedsDebtCeiling ||
      generateAmountLessThanDebtFloor ||
      generateAmountMoreThanMaxFlashAmount ||
      paybackAmountExceedsDaiBalance ||
      paybackAmountExceedsVaultDebt ||
      withdrawCollateralOnVaultUnderDebtFloor ||
      shouldShowExchangeError ||
      hasToDepositCollateralOnEmptyVault ||
      invalidSlippage ||
      afterCollRatioBelowStopLossRatio ||
      afterCollRatioBelowBasicSellRatio ||
      afterCollRatioAboveBasicBuyRatio)

  const editingProgressionDisabledForUncontrolled =
    !accountIsController &&
    (stage === 'adjustPosition' ||
      (stage === 'otherActions' &&
        ['depositDai', 'withdrawDai', 'withdrawCollateral', 'closeVault'].includes(otherAction)))

  const collateralAllowanceProgressionDisabled = collateralAllowanceProgressionDisabledValidator({
    isCollateralAllowanceStage,
    customCollateralAllowanceAmountEmpty,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,
  })

  const daiAllowanceProgressionDisabled = daiAllowanceProgressionDisabledValidator({
    isDaiAllowanceStage,
    customDaiAllowanceAmountEmpty,
    customDaiAllowanceAmountLessThanPaybackAmount,
    customDaiAllowanceAmountExceedsMaxUint256,
  })

  const potentialGenerateAmountLessThanDebtFloor =
    !isNullish(depositAmount) &&
    maxGenerateAmountAtCurrentPrice.lt(debtFloor) &&
    !debt.gt(debtFloor)

  const debtIsLessThanDebtFloor = debtIsLessThanDebtFloorValidator({ debtFloor, debt })

  const borrowTransitionDisabled = isBorrowTransitionStage && !accountIsController

  const canProgress = !(
    isLoadingStage ||
    editingProgressionDisabled ||
    editingProgressionDisabledForUncontrolled ||
    collateralAllowanceProgressionDisabled ||
    daiAllowanceProgressionDisabled ||
    isExchangeLoading ||
    borrowTransitionDisabled
  )

  const canRegress = ([
    'proxyWaitingForConfirmation',
    'proxyFailure',
    'collateralAllowanceWaitingForConfirmation',
    'collateralAllowanceFailure',
    'daiAllowanceWaitingForConfirmation',
    'daiAllowanceFailure',
    'manageWaitingForConfirmation',
    'manageFailure',
    'borrowTransitionEditing',
    'borrowTransitionWaitingForConfirmation',
    'borrowTransitionFailure',
  ] as ManageMultiplyVaultStage[]).some((s) => s === stage)

  const stopLossTriggered = stopLossTriggeredValidator({ vaultHistory })

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  return {
    ...state,
    canProgress,
    canRegress,

    depositAndWithdrawAmountsEmpty,
    generateAndPaybackAmountsEmpty,
    inputAmountsEmpty,

    vaultWillBeAtRiskLevelWarning,
    vaultWillBeAtRiskLevelWarningAtNextPrice,
    vaultWillBeAtRiskLevelDanger,
    vaultWillBeAtRiskLevelDangerAtNextPrice,
    vaultWillBeUnderCollateralized,
    vaultWillBeUnderCollateralizedAtNextPrice,
    potentialGenerateAmountLessThanDebtFloor,
    debtIsLessThanDebtFloor,

    accountIsConnected,
    accountIsController,
    depositingAllEthBalance,
    generateAmountExceedsDebtCeiling,
    depositAmountExceedsCollateralBalance,
    depositDaiAmountExceedsDaiBalance,
    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountLessThanDebtFloor,
    generateAmountMoreThanMaxFlashAmount,
    paybackAmountExceedsDaiBalance,
    paybackAmountExceedsVaultDebt,
    ledgerWalletContractDataDisabled,
    shouldPaybackAll,
    debtWillBeLessThanDebtFloor,
    isLoadingStage,
    isSuccessStage,
    exchangeDataRequired,
    shouldShowExchangeError,
    isExchangeLoading,

    insufficientCollateralAllowance,
    customCollateralAllowanceAmountEmpty,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,

    insufficientDaiAllowance,
    customDaiAllowanceAmountEmpty,
    customDaiAllowanceAmountExceedsMaxUint256,
    customDaiAllowanceAmountLessThanPaybackAmount,

    withdrawCollateralOnVaultUnderDebtFloor,

    hasToDepositCollateralOnEmptyVault,

    highSlippage,
    stopLossTriggered,
    afterCollRatioBelowStopLossRatio,
    afterCollRatioBelowBasicSellRatio,
    afterCollRatioAboveBasicBuyRatio,

    insufficientEthFundsForTx,
  }
}
