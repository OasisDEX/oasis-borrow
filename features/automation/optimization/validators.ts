import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
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
  constantMultipleTriggerData: any
  isRemoveForm: boolean
}) {
  const { maxBuyOrMinSellPrice, txDetails, withThreshold, execCollRatio } = basicBuyState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoBuyTriggerLowerThanAutoSellTarget =
    autoSellTriggerData.isTriggerEnabled &&
    execCollRatio.minus(5).lt(autoSellTriggerData.targetCollRatio)

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
  sliderMin,
  isStopLossEnabled,
  isAutoBuyEnabled,
  isAutoSellEnabled,
  constantMultipleState,
}: {
  vault: Vault
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoBuyEnabled: boolean
  isAutoSellEnabled: boolean
  constantMultipleState: ConstantMultipleFormChange
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: vault.token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const constantMultipleSellTriggerCloseToStopLossTrigger =
    isStopLossEnabled && constantMultipleState.sellExecutionCollRatio.isEqualTo(sliderMin)

  const addingConstantMultipleWhenAutoSellOrBuyEnabled = isAutoBuyEnabled || isAutoSellEnabled

  const constantMultipleAutoSellTriggeredImmediately = constantMultipleState.sellExecutionCollRatio
    .div(100)
    .gte(vault.collateralizationRatioAtNextPrice)

  const constantMultipleAutoBuyTriggeredImmediately = constantMultipleState.buyExecutionCollRatio
    .div(100)
    .lte(vault.collateralizationRatioAtNextPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    constantMultipleSellTriggerCloseToStopLossTrigger,
    addingConstantMultipleWhenAutoSellOrBuyEnabled,
    constantMultipleAutoSellTriggeredImmediately,
    constantMultipleAutoBuyTriggeredImmediately,
  })
}
