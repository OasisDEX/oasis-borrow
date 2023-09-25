import type BigNumber from 'bignumber.js'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { zero } from 'helpers/zero'

import type { ConstantMultipleFormChange } from './state/constantMultipleFormChange.types'

export function warningsConstantMultipleValidation({
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  debtFloor,
  sliderMin,
  isStopLossEnabled,
  isAutoBuyEnabled,
  isAutoSellEnabled,
  isAutoTakeProfitEnabled,
  constantMultipleState,
  debtDeltaWhenSellAtCurrentCollRatio,
  autoTakeProfitExecutionPrice,
  constantMultipleBuyExecutionPrice,
  debt,
  token,
  nextPositionRatio,
}: {
  token: string
  ethBalance: BigNumber
  debt: BigNumber
  debtFloor: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoBuyEnabled: boolean
  isAutoSellEnabled: boolean
  isAutoTakeProfitEnabled: boolean
  constantMultipleState: ConstantMultipleFormChange
  autoTakeProfitExecutionPrice: BigNumber
  constantMultipleBuyExecutionPrice: BigNumber
  nextPositionRatio: BigNumber
}) {
  const { sellExecutionCollRatio, buyExecutionCollRatio, sellWithThreshold, buyWithThreshold } =
    constantMultipleState

  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const constantMultipleSellTriggerCloseToStopLossTrigger =
    isStopLossEnabled && sellExecutionCollRatio.isEqualTo(sliderMin)

  const addingConstantMultipleWhenAutoSellOrBuyEnabled = isAutoBuyEnabled || isAutoSellEnabled

  const constantMultipleAutoSellTriggeredImmediately =
    sellExecutionCollRatio.div(100).gte(nextPositionRatio) &&
    !debtFloor.gt(debt.plus(debtDeltaWhenSellAtCurrentCollRatio))

  const constantMultipleAutoBuyTriggeredImmediately = buyExecutionCollRatio
    .div(100)
    .lte(nextPositionRatio)

  const noMinSellPriceWhenStopLossEnabled = !sellWithThreshold && isStopLossEnabled

  const settingAutoBuyTriggerWithNoThreshold = !buyWithThreshold

  const constantMultipleBuyTriggerGreaterThanAutoTakeProfit =
    isAutoTakeProfitEnabled && constantMultipleBuyExecutionPrice.gt(autoTakeProfitExecutionPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
    constantMultipleSellTriggerCloseToStopLossTrigger,
    addingConstantMultipleWhenAutoSellOrBuyEnabled,
    constantMultipleAutoSellTriggeredImmediately,
    constantMultipleAutoBuyTriggeredImmediately,
    noMinSellPriceWhenStopLossEnabled,
    constantMultipleBuyTriggerGreaterThanAutoTakeProfit,
  })
}

export function errorsConstantMultipleValidation({
  constantMultipleState,
  isRemoveForm,
  debt,
  debtFloor,
  debtDeltaAfterSell,
  debtDeltaWhenSellAtCurrentCollRatio,
  nextBuyPrice,
  nextSellPrice,
}: {
  constantMultipleState: ConstantMultipleFormChange
  isRemoveForm: boolean
  debtDeltaAfterSell: BigNumber
  debtFloor: BigNumber
  debt: BigNumber
  debtDeltaWhenSellAtCurrentCollRatio: BigNumber
  nextBuyPrice: BigNumber
  nextSellPrice: BigNumber
}) {
  const { minSellPrice, maxBuyPrice, txDetails, buyWithThreshold, sellWithThreshold } =
    constantMultipleState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && buyWithThreshold && (!maxBuyPrice || maxBuyPrice.isZero())

  const minimumSellPriceNotProvided =
    !isRemoveForm && sellWithThreshold && (!minSellPrice || minSellPrice.isZero())

  const targetCollRatioExceededDustLimitCollRatio =
    !isRemoveForm &&
    (debtFloor.gt(debt.plus(debtDeltaAfterSell)) ||
      debtFloor.gt(debt.plus(debtDeltaWhenSellAtCurrentCollRatio)))

  const maxBuyPriceWillPreventBuyTrigger = maxBuyPrice?.gt(zero) && maxBuyPrice.lt(nextBuyPrice)
  const minSellPriceWillPreventSellTrigger =
    minSellPrice?.gt(zero) && minSellPrice.gt(nextSellPrice)

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    minimumSellPriceNotProvided,
    targetCollRatioExceededDustLimitCollRatio,
    maxBuyPriceWillPreventBuyTrigger,
    minSellPriceWillPreventSellTrigger,
  })
}
