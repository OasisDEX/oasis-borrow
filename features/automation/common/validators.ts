import BigNumber from 'bignumber.js'
import { MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/protection/common/consts/automationDefaults'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsBasicSellValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  minSellPrice,
  isStopLossEnabled,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  minSellPrice?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })
  const noMinSellPriceWhenStopLossEnabled =
    (minSellPrice?.isZero() || !minSellPrice) && isStopLossEnabled

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    noMinSellPriceWhenStopLossEnabled,
  })
}

export function errorsBasicSellValidation({
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
