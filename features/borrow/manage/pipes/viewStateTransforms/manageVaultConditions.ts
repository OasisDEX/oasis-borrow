import type { ManageStandardBorrowVaultState } from 'features/borrow/manage/pipes/manageVault.types'
import type { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/types/ManageBorrowVaultStage.types'
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

import { defaultManageVaultStageCategories } from './manageVaultConditions.constants'

export function applyManageVaultStageCategorisation<
  VaultState extends ManageStandardBorrowVaultState,
>(state: VaultState): VaultState {
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

export function applyManageVaultConditions<VaultState extends ManageStandardBorrowVaultState>(
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
    vault: { controller, debt, token, debtOffset },
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
    txError,
    vaultHistory,
    stopLossData,
    autoSellData,
    autoBuyData,
    constantMultipleData,
    autoTakeProfitData,
  } = state

  const depositAndWithdrawAmountsEmpty = depositAndWithdrawAmountsEmptyValidator({
    depositAmount,
    withdrawAmount,
  })

  const generateAndPaybackAmountsEmpty = generateAndPaybackAmountsEmptyValidator({
    generateAmount,
    paybackAmount,
  })

  const inputAmountsEmpty = depositAndWithdrawAmountsEmpty && generateAndPaybackAmountsEmpty

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
