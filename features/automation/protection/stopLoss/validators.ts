import BigNumber from 'bignumber.js'
import { notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

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
