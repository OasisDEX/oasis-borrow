import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { ConstantMultipleFormChange } from 'features/automation/optimization/constantMultiple/state/constantMultipleFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

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

  const constantMultipleAutoSellTriggeredImmediately = sellExecutionCollRatio
    .div(100)
    .gte(vault.collateralizationRatioAtNextPrice)

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
}: {
  constantMultipleState: ConstantMultipleFormChange
  isRemoveForm: boolean
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

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    minimumSellPriceNotProvided,
  })
}
