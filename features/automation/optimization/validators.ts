import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { MIX_MAX_COL_RATIO_TRIGGER_OFFSET } from 'features/automation/common/consts'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

export function warningsBasicBuyValidation({
  vault,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMin,
  isStopLossEnabled,
  isAutoSellEnabled,
  basicBuyState,
  withThreshold,
}: {
  vault: Vault
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoSellEnabled: boolean
  basicBuyState: BasicBSFormChange
  minSellPrice?: BigNumber
  withThreshold: boolean
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: vault.token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const autoBuyTargetCloseToStopLossTrigger =
    isStopLossEnabled && !isAutoSellEnabled && basicBuyState.targetCollRatio.isEqualTo(sliderMin)

  const autoBuyTargetCloseToAutoSellTrigger =
    isAutoSellEnabled && basicBuyState.targetCollRatio.isEqualTo(sliderMin)

  const settingAutoBuyTriggerWithNoThreshold = !withThreshold

  const autoBuyTriggeredImmediately = basicBuyState.execCollRatio
    .div(100)
    .lte(vault.collateralizationRatioAtNextPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
    autoBuyTargetCloseToStopLossTrigger,
    autoBuyTargetCloseToAutoSellTrigger,
    autoBuyTriggeredImmediately,
  })
}

export function errorsBasicBuyValidation({
  basicBuyState,
  autoSellTriggerData,
  constantMultipleTriggerData,
  isRemoveForm,
}: {
  basicBuyState: BasicBSFormChange
  autoSellTriggerData: BasicBSTriggerData
  constantMultipleTriggerData: ConstantMultipleTriggerData
  isRemoveForm: boolean
}) {
  const { maxBuyOrMinSellPrice, txDetails, withThreshold, execCollRatio } = basicBuyState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoBuyTriggerLowerThanAutoSellTarget =
    autoSellTriggerData.isTriggerEnabled &&
    execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET).lt(autoSellTriggerData.targetCollRatio)

  const cantSetupAutoBuyOrSellWhenConstantMultipleEnabled =
    constantMultipleTriggerData.isTriggerEnabled

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    autoBuyTriggerLowerThanAutoSellTarget,
    cantSetupAutoBuyOrSellWhenConstantMultipleEnabled,
  })
}

export function warningsConstantMultipleValidation({
  vault,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  debtFloor,
  sliderMin,
  isStopLossEnabled,
  isAutoBuyEnabled,
  isAutoSellEnabled,
  constantMultipleState,
  debtDeltaWhenSellAtCurrentCollRatio,
}: {
  vault: Vault
  ethBalance: BigNumber
  debtFloor: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoBuyEnabled: boolean
  isAutoSellEnabled: boolean
  constantMultipleState: ConstantMultipleFormChange
}) {
  const {
    sellExecutionCollRatio,
    buyExecutionCollRatio,
    sellWithThreshold,
    buyWithThreshold,
  } = constantMultipleState

  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: vault.token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const constantMultipleSellTriggerCloseToStopLossTrigger =
    isStopLossEnabled && sellExecutionCollRatio.isEqualTo(sliderMin)

  const addingConstantMultipleWhenAutoSellOrBuyEnabled = isAutoBuyEnabled || isAutoSellEnabled

  const constantMultipleAutoSellTriggeredImmediately =
    sellExecutionCollRatio.div(100).gte(vault.collateralizationRatioAtNextPrice) &&
    !debtFloor.gt(vault.debt.plus(debtDeltaWhenSellAtCurrentCollRatio))

  const constantMultipleAutoBuyTriggeredImmediately = buyExecutionCollRatio
    .div(100)
    .lte(vault.collateralizationRatioAtNextPrice)

  const noMinSellPriceWhenStopLossEnabled = !sellWithThreshold && isStopLossEnabled

  const settingAutoBuyTriggerWithNoThreshold = !buyWithThreshold

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
    constantMultipleSellTriggerCloseToStopLossTrigger,
    addingConstantMultipleWhenAutoSellOrBuyEnabled,
    constantMultipleAutoSellTriggeredImmediately,
    constantMultipleAutoBuyTriggeredImmediately,
    noMinSellPriceWhenStopLossEnabled,
  })
}

export function errorsConstantMultipleValidation({
  constantMultipleState,
  isRemoveForm,
  debt,
  debtFloor,
  debtDeltaAfterSell,
  debtDeltaWhenSellAtCurrentCollRatio,
}: {
  constantMultipleState: ConstantMultipleFormChange
  isRemoveForm: boolean
  debtDeltaAfterSell: BigNumber
  debtFloor: BigNumber
  debt: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
}) {
  const {
    minSellPrice,
    maxBuyPrice,
    txDetails,
    buyWithThreshold,
    sellWithThreshold,
  } = constantMultipleState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && buyWithThreshold && (!maxBuyPrice || maxBuyPrice.isZero())

  const minimumSellPriceNotProvided =
    !isRemoveForm && sellWithThreshold && (!minSellPrice || minSellPrice.isZero())

  const targetCollRatioExceededDustLimitCollRatio =
    !isRemoveForm &&
    (debtFloor.gt(debt.plus(debtDeltaAfterSell)) ||
      debtFloor.gt(debt.plus(debtDeltaWhenSellAtCurrentCollRatio)))

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    minimumSellPriceNotProvided,
    targetCollRatioExceededDustLimitCollRatio,
  })
}
