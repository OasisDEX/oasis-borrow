import BigNumber from 'bignumber.js'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/protection/common/consts/automationDefaults'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsStopLossValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMax,
  isAutoSellEnabled,
  isConstantMultipleEnabled,
  triggerRatio,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMax?: BigNumber
  triggerRatio?: BigNumber
  isAutoSellEnabled?: boolean
  isConstantMultipleEnabled?: boolean
  gasEstimationUsd?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })
  const stopLossTriggerCloseToAutoSellTrigger =
    isAutoSellEnabled && sliderMax && triggerRatio?.isEqualTo(sliderMax)
  const stopLossTriggerCloseToConstantMultipleSellTrigger =
    isConstantMultipleEnabled && sliderMax && triggerRatio?.isEqualTo(sliderMax)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    stopLossTriggerCloseToAutoSellTrigger,
    stopLossTriggerCloseToConstantMultipleSellTrigger,
  })
}

export function errorsStopLossValidation({
  txError,
  debt,
  stopLossLevel,
  autoBuyTriggerData,
}: {
  txError?: TxError
  debt: BigNumber
  stopLossLevel?: BigNumber
  autoBuyTriggerData?: BasicBSTriggerData
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  const maxDebtForSettingStopLoss = debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)
  const stopLossTriggerHigherThanAutoBuyTarget =
    stopLossLevel && autoBuyTriggerData?.isTriggerEnabled
      ? stopLossLevel.plus(5).gt(autoBuyTriggerData.targetCollRatio)
      : false

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    maxDebtForSettingStopLoss,
    stopLossTriggerHigherThanAutoBuyTarget,
  })
}
