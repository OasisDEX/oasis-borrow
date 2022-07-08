import BigNumber from 'bignumber.js'
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
  triggerRatio,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMax?: BigNumber
  triggerRatio?: BigNumber
  isAutoSellEnabled?: boolean
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

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    stopLossTriggerCloseToAutoSellTrigger,
  })
}

export function errorsStopLossValidation({
  txError,
  debt,
}: {
  txError?: TxError
  debt: BigNumber
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  const maxDebtForSettingStopLoss = debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)

  return errorMessagesHandler({ insufficientEthFundsForTx, maxDebtForSettingStopLoss })
}
