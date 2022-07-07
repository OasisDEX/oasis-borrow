import BigNumber from 'bignumber.js'
import { MAX_DEBT_FOR_SETTING_STOP_LOSS } from 'features/automation/protection/common/consts/automationDefaults'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
  })
}

export function errorsValidation({ txError, debt }: { txError?: TxError; debt: BigNumber }) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  const maxDebtForSettingStopLoss = debt.gt(MAX_DEBT_FOR_SETTING_STOP_LOSS)

  return errorMessagesHandler({ insufficientEthFundsForTx, maxDebtForSettingStopLoss })
}
