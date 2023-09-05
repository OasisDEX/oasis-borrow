import { FLASH_MINT_LIMIT_PER_TX } from 'components/constants'
import {
  ManageBorrowVaultStage,
  ManageBorrowVaultState,
} from 'features/borrow/manage/pipes/manageVault'
import {
  accountIsConnectedValidator,
  accountIsControllerValidator,
  afterCollRatioThresholdRatioValidator,
  automationTriggeredValidator,
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
  vaultEmptyNextPriceAboveOrBelowTakeProfitPriceValidator,
  vaultWillBeAtRiskLevelDangerAtNextPriceValidator,
  vaultWillBeAtRiskLevelDangerValidator,
  vaultWillBeAtRiskLevelWarningAtNextPriceValidator,
  vaultWillBeAtRiskLevelWarningValidator,
  withdrawAmountExceedsFreeCollateralAtNextPriceValidator,
  withdrawAmountExceedsFreeCollateralValidator,
  withdrawCollateralOnVaultUnderDebtFloorValidator,
} from 'features/form/commonValidators'
import { isNullish } from 'helpers/functions'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { zero } from 'helpers/zero'

const defaultManageVaultStageCategories = {
  isEditingStage: false,
  isProxyStage: false,
  isCollateralAllowanceStage: false,
  isDaiAllowanceStage: false,
  isManageStage: false,
  isMultiplyTransitionStage: false,
}

export function applyManageVaultStageCategorisation<VaultState extends ManageBorrowVaultState>(
  state: VaultState,
): VaultState {
  const {
    stage,
    vault: { token, debtOffset },
    depositAmount,
    daiAllowance,
    collateralAllowance,
    paybackAmount,
    initialTotalSteps,
  } = state
  const isDepositZero = depositAmount ? depositAmount.eq(zero) : true
  const isPaybackZero = paybackAmount ? paybackAmount.eq(zero) : true

  const depositAmountLessThanCollateralAllowance =
    collateralAllowance && depositAmount && collateralAllowance.gte(depositAmount)

  const paybackAmountLessThanDaiAllowance =
    daiAllowance && paybackAmount && daiAllowance.gte(paybackAmount.plus(debtOffset))

  const hasCollateralAllowance =
    token === 'ETH' ? true : depositAmountLessThanCollateralAllowance || isDepositZero

  const hasDaiAllowance = paybackAmountLessThanDaiAllowance || isPaybackZero

  let totalSteps = initialTotalSteps

  if (initialTotalSteps === 2 && (!hasCollateralAllowance || !hasDaiAllowance)) {
    totalSteps = 3
  }

  if (initialTotalSteps === 3 && hasCollateralAllowance && hasDaiAllowance && !isPaybackZero) {
    totalSteps = 2
  }

  switch (stage) {
    case 'collateralEditing':
    case 'adjustPosition':
    case 'otherActions':
    case 'daiEditing':
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
    case 'multiplyTransitionEditing':
    case 'multiplyTransitionWaitingForConfirmation':
    case 'multiplyTransitionInProgress':
    case 'multiplyTransitionFailure':
    case 'multiplyTransitionSuccess':
      return {
        ...state,
        ...defaultManageVaultStageCategories,
        isMultiplyTransitionStage: true,
        totalSteps: 2,
        currentStep: stage === 'multiplyTransitionEditing' ? 1 : 2,
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
  isMultiplyTransitionStage: boolean

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
  depositCollateralOnVaultUnderDebtFloor: boolean

  hasToDepositCollateralOnEmptyVault: boolean

  stopLossTriggered: boolean
  autoTakeProfitTriggered: boolean
  afterCollRatioBelowStopLossRatio: boolean
  afterCollRatioBelowAutoSellRatio: boolean
  afterCollRatioAboveAutoBuyRatio: boolean
  afterCollRatioBelowConstantMultipleSellRatio: boolean
  afterCollRatioAboveConstantMultipleBuyRatio: boolean
  takeProfitWillTriggerImmediatelyAfterVaultReopen: boolean
  existingTakeProfitTriggerAfterVaultReopen: boolean

  potentialInsufficientEthFundsForTx: boolean
  insufficientEthFundsForTx: boolean
}

export const defaultManageVaultConditions: ManageVaultConditions = {
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
  depositCollateralOnVaultUnderDebtFloor: false,

  hasToDepositCollateralOnEmptyVault: false,

  stopLossTriggered: false,
  autoTakeProfitTriggered: false,
  afterCollRatioBelowStopLossRatio: false,
  afterCollRatioBelowAutoSellRatio: false,
  afterCollRatioAboveAutoBuyRatio: false,
  afterCollRatioBelowConstantMultipleSellRatio: false,
  afterCollRatioAboveConstantMultipleBuyRatio: false,
  takeProfitWillTriggerImmediatelyAfterVaultReopen: false,
  existingTakeProfitTriggerAfterVaultReopen: false,

  potentialInsufficientEthFundsForTx: false,
  insufficientEthFundsForTx: false,
}

export function applyManageVaultConditions<VaultState extends ManageBorrowVaultState>(
  state: VaultState,
): VaultState {
  const {
    depositAmount,
    generateAmount,
    withdrawAmount,
    paybackAmount,
    afterCollateralizationRatio,
    afterCollateralizationRatioAtNextPrice,
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
    priceInfo: { nextCollateralPrice },
    isEditingStage,
    isCollateralAllowanceStage,
    isDaiAllowanceStage,
    maxWithdrawAmountAtCurrentPrice,
    maxWithdrawAmountAtNextPrice,
    maxGenerateAmountAtCurrentPrice,
    maxGenerateAmountAtNextPrice,
    isMultiplyTransitionStage,
    afterDebt,
    vaultHistory,
    stopLossData,
    autoSellData,
    autoBuyData,
    constantMultipleData,
    autoTakeProfitData,
    mainAction,

    otherAction,

    originalEditingStage,
    txError,

    quote,
    swap,
    exchangeError,

    requiredCollRatio,

    debtDelta
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
      (originalEditingStage === 'collateralEditing' && mainAction === 'depositGenerate') ||
      (originalEditingStage === 'daiEditing' && mainAction === 'depositGenerate')
    )

  const inputAmountsEmpty = stage === 'otherActions' && otherAction === 'closeVault' 
    ? false 
    : stage === 'adjustPosition' ?
      !requiredCollRatio
      : (depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty )

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

  const vaultWillBeAtRiskLevelWarningAtNextPrice =
    vaultWillBeAtRiskLevelWarningAtNextPriceValidator({
      vaultWillBeAtRiskLevelWarning,
      inputAmountsEmpty,
      afterCollateralizationRatioAtNextPrice,
      collateralizationDangerThreshold,
      collateralizationWarningThreshold,
    })

  const vaultWillBeUnderCollateralized =
    !inputAmountsEmpty &&
    afterCollateralizationRatio.lt(liquidationRatio) &&
    !afterCollateralizationRatio.isZero()

  const vaultWillBeUnderCollateralizedAtNextPrice =
    !vaultWillBeUnderCollateralized &&
    !inputAmountsEmpty &&
    afterCollateralizationRatioAtNextPrice.lt(liquidationRatio) &&
    !afterCollateralizationRatioAtNextPrice.isZero()

  const accountIsConnected = accountIsConnectedValidator({ account })
  const accountIsController = accountIsControllerValidator({
    accountIsConnected,
    account,
    controller,
  })

  const depositAmountExceedsCollateralBalance = !!depositAmount?.gt(collateralBalance)

  const depositingAllEthBalance = depositingAllEthBalanceValidator({
    token,
    depositAmount,
    collateralBalance,
  })

  const withdrawAmountExceedsFreeCollateral = withdrawAmountExceedsFreeCollateralValidator({
    withdrawAmount,
    maxWithdrawAmountAtCurrentPrice,
  })

  const withdrawAmountExceedsFreeCollateralAtNextPrice =
    withdrawAmountExceedsFreeCollateralAtNextPriceValidator({
      withdrawAmount,
      withdrawAmountExceedsFreeCollateral,
      maxWithdrawAmountAtNextPrice,
    })

  const generateAmountExceedsDebtCeiling = !!generateAmount?.gt(ilkDebtAvailable)

  const generateAmountExceedsDaiYieldFromTotalCollateral =
    !generateAmountExceedsDebtCeiling && !!generateAmount?.gt(maxGenerateAmountAtCurrentPrice)

  const generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice =
    !generateAmountExceedsDebtCeiling &&
    !generateAmountExceedsDaiYieldFromTotalCollateral &&
    !!generateAmount?.gt(maxGenerateAmountAtNextPrice)

  const generateAmountLessThanDebtFloor = !!(
    generateAmount &&
    !generateAmount.plus(debt).isZero() &&
    generateAmount.plus(debt).lt(debtFloor)
  )

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

  const debtWillBeLessThanDebtFloor = !!(
    paybackAmount &&
    debt.minus(paybackAmount).lt(debtFloor) &&
    debt.minus(paybackAmount).gt(zero) &&
    !shouldPaybackAll
  )
  const customCollateralAllowanceAmountEmpty = customCollateralAllowanceAmountEmptyValidator({
    selectedCollateralAllowanceRadio,
    collateralAllowanceAmount,
  })

  const customDaiAllowanceAmountEmpty = customDaiAllowanceAmountEmptyValidator({
    selectedDaiAllowanceRadio,
    daiAllowanceAmount,
  })

  const customCollateralAllowanceAmountExceedsMaxUint256 =
    customCollateralAllowanceAmountExceedsMaxUint256Validator({
      selectedCollateralAllowanceRadio,
      collateralAllowanceAmount,
    })

  const customCollateralAllowanceAmountLessThanDepositAmount =
    customCollateralAllowanceAmountLessThanDepositAmountValidator({
      selectedCollateralAllowanceRadio,
      collateralAllowanceAmount,
      depositAmount,
    })

  const customDaiAllowanceAmountExceedsMaxUint256 =
    customDaiAllowanceAmountExceedsMaxUint256Validator({
      selectedDaiAllowanceRadio,
      daiAllowanceAmount,
    })

  const customDaiAllowanceAmountLessThanPaybackAmount =
    customDaiAllowanceAmountLessThanPaybackAmountValidator({
      selectedDaiAllowanceRadio,
      daiAllowanceAmount,
      paybackAmount,
    })

  const insufficientCollateralAllowance = insufficientCollateralAllowanceValidator({
    token,
    depositAmount,
    collateralAllowance,
  })

  const ledgerWalletContractDataDisabled = ledgerWalletContractDataDisabledValidator({ txError })

  const insufficientDaiAllowance = insufficientDaiAllowanceValidator({
    paybackAmount,
    daiAllowance,
    debtOffset,
  })

  const isLoadingStage = (
    [
      'proxyInProgress',
      'proxyWaitingForApproval',
      'collateralAllowanceWaitingForApproval',
      'collateralAllowanceInProgress',
      'daiAllowanceWaitingForApproval',
      'daiAllowanceInProgress',
      'manageInProgress',
      'manageWaitingForApproval',
      'multiplyTransitionInProgress',
      'multiplyTransitionSuccess',
    ] as ManageBorrowVaultStage[]
  ).some((s) => s === stage)

  const isSuccessStage = stage === 'manageSuccess'

  const withdrawCollateralOnVaultUnderDebtFloor = withdrawCollateralOnVaultUnderDebtFloorValidator({
    debtFloor,
    debt,
    withdrawAmount,
    paybackAmount,
  })

  const depositCollateralOnVaultUnderDebtFloor =
    debt.gt(zero) &&
    debt.lt(debtFloor) &&
    depositAmount !== undefined &&
    depositAmount.lt(debtFloor) &&
    afterDebt.lt(debtFloor)

  const afterCollRatioBelowStopLossRatio =
    !!stopLossData?.isStopLossEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: stopLossData.stopLossLevel,
      type: 'below',
    })

  const afterCollRatioBelowAutoSellRatio =
    !!autoSellData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: autoSellData.execCollRatio.div(100),
      type: 'below',
    })

  const afterCollRatioAboveAutoBuyRatio =
    !!autoBuyData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: autoBuyData.execCollRatio.div(100),
      type: 'above',
    })

  const afterCollRatioBelowConstantMultipleSellRatio =
    !!constantMultipleData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: constantMultipleData.sellExecutionCollRatio.div(100),
      type: 'below',
    })

  const afterCollRatioAboveConstantMultipleBuyRatio =
    !!constantMultipleData?.isTriggerEnabled &&
    afterCollRatioThresholdRatioValidator({
      afterCollateralizationRatio,
      afterCollateralizationRatioAtNextPrice,
      threshold: constantMultipleData.buyExecutionCollRatio.div(100),
      type: 'above',
    })

  const takeProfitWillTriggerImmediatelyAfterVaultReopen =
    vaultEmptyNextPriceAboveOrBelowTakeProfitPriceValidator({
      debt,
      afterDebt,
      nextCollateralPrice,
      type: 'above',
      isTriggerEnabled: autoTakeProfitData?.isTriggerEnabled,
      executionPrice: autoTakeProfitData?.executionPrice,
    })

  const existingTakeProfitTriggerAfterVaultReopen =
    vaultEmptyNextPriceAboveOrBelowTakeProfitPriceValidator({
      debt,
      afterDebt,
      nextCollateralPrice,
      type: 'below',
      isTriggerEnabled: autoTakeProfitData?.isTriggerEnabled,
      executionPrice: autoTakeProfitData?.executionPrice,
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
      withdrawAmountExceedsFreeCollateral ||
      withdrawAmountExceedsFreeCollateralAtNextPrice ||
      depositingAllEthBalance ||
      generateAmountExceedsDebtCeiling ||
      generateAmountLessThanDebtFloor ||
      paybackAmountExceedsDaiBalance ||
      paybackAmountExceedsVaultDebt ||
      withdrawCollateralOnVaultUnderDebtFloor ||
      depositCollateralOnVaultUnderDebtFloor ||
      hasToDepositCollateralOnEmptyVault ||
      afterCollRatioBelowStopLossRatio ||
      afterCollRatioBelowAutoSellRatio ||
      afterCollRatioAboveAutoBuyRatio ||
      afterCollRatioBelowConstantMultipleSellRatio ||
      afterCollRatioAboveConstantMultipleBuyRatio ||
      takeProfitWillTriggerImmediatelyAfterVaultReopen)

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
    !isNullish(depositAmount) && state.daiYieldFromTotalCollateralWithoutDebt.lt(debtFloor)

  const debtIsLessThanDebtFloor = debtIsLessThanDebtFloorValidator({ debtFloor, debt })

  const multiplyTransitionDisabled = isMultiplyTransitionStage && !accountIsController

  const canProgress = !(
    isLoadingStage ||
    editingProgressionDisabled ||
    collateralAllowanceProgressionDisabled ||
    daiAllowanceProgressionDisabled ||
    multiplyTransitionDisabled
  )

  const canRegress = (
    [
      'proxyWaitingForConfirmation',
      'proxyFailure',
      'collateralAllowanceWaitingForConfirmation',
      'collateralAllowanceFailure',
      'daiAllowanceWaitingForConfirmation',
      'daiAllowanceFailure',
      'manageWaitingForConfirmation',
      'manageFailure',
      'multiplyTransitionEditing',
      'multiplyTransitionWaitingForConfirmation',
      'multiplyTransitionFailure',
    ] as ManageBorrowVaultStage[]
  ).some((s) => s === stage)

  const { stopLossTriggered, autoTakeProfitTriggered } = automationTriggeredValidator({
    vaultHistory,
  })

  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  const isDepositOrWithdrawAndMultiply = !!state.requiredCollRatio?.gt(zero)
  const exchangeDataRequired =
  originalEditingStage === 'adjustPosition' ||
  (originalEditingStage === 'otherActions' &&
    ((otherAction === 'closeVault' && !debt.isZero()) || isDepositOrWithdrawAndMultiply))

  const shouldShowExchangeError = exchangeDataRequired && exchangeError

  const isExchangeLoading = exchangeDataRequired && !quote && !swap && !exchangeError


  return {
    ...state,
    canProgress,
    canRegress,

    exchangeDataRequired,
    shouldShowExchangeError,
    isExchangeLoading,

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
    insufficientEthFundsForTx,

    accountIsConnected,
    accountIsController,
    depositingAllEthBalance,
    generateAmountExceedsDebtCeiling,
    depositAmountExceedsCollateralBalance,
    withdrawAmountExceedsFreeCollateral,
    withdrawAmountExceedsFreeCollateralAtNextPrice,
    generateAmountExceedsDaiYieldFromTotalCollateral,
    generateAmountExceedsDaiYieldFromTotalCollateralAtNextPrice,
    generateAmountLessThanDebtFloor,
    paybackAmountExceedsDaiBalance,
    paybackAmountExceedsVaultDebt,
    ledgerWalletContractDataDisabled,
    shouldPaybackAll,
    debtWillBeLessThanDebtFloor,
    isLoadingStage,
    isSuccessStage,

    generateAmountMoreThanMaxFlashAmount,

    insufficientCollateralAllowance,
    customCollateralAllowanceAmountEmpty,
    customCollateralAllowanceAmountExceedsMaxUint256,
    customCollateralAllowanceAmountLessThanDepositAmount,

    insufficientDaiAllowance,
    customDaiAllowanceAmountEmpty,
    customDaiAllowanceAmountExceedsMaxUint256,
    customDaiAllowanceAmountLessThanPaybackAmount,

    withdrawCollateralOnVaultUnderDebtFloor,
    depositCollateralOnVaultUnderDebtFloor,

    hasToDepositCollateralOnEmptyVault,

    stopLossTriggered,
    autoTakeProfitTriggered,
    afterCollRatioBelowStopLossRatio,
    afterCollRatioBelowAutoSellRatio,
    afterCollRatioAboveAutoBuyRatio,
    afterCollRatioBelowConstantMultipleSellRatio,
    afterCollRatioAboveConstantMultipleBuyRatio,
    takeProfitWillTriggerImmediatelyAfterVaultReopen,
    existingTakeProfitTriggerAfterVaultReopen,
  }
}
