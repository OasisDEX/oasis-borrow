import type BigNumber from 'bignumber.js'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import type { TxError } from 'helpers/types'

export function warningsAutoTakeProfitValidation({
  token,
  ethBalance,
  ethPrice,
  executionPrice,
  isAutoBuyEnabled,
  autoBuyTriggerPrice,
  gasEstimationUsd,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  executionPrice: BigNumber
  isAutoBuyEnabled: boolean
  autoBuyTriggerPrice: BigNumber
  gasEstimationUsd?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const autoTakeProfitTriggerLowerThanAutoBuyTrigger =
    isAutoBuyEnabled && executionPrice.lte(autoBuyTriggerPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    autoTakeProfitTriggerLowerThanAutoBuyTrigger,
  })
}

export function errorsAutoTakeProfitValidation({
  nextCollateralPrice,
  executionPrice,
  txError,
}: {
  nextCollateralPrice: BigNumber
  executionPrice: BigNumber
  txError?: TxError
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({
    txError,
  })

  const autoTakeProfitTriggeredImmediately = executionPrice.lte(nextCollateralPrice)

  return errorMessagesHandler({ autoTakeProfitTriggeredImmediately, insufficientEthFundsForTx })
}
