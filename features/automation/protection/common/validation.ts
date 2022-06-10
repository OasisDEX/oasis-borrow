import BigNumber from 'bignumber.js'
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

export function errorsValidation({ txError }: { txError?: TxError }) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  return errorMessagesHandler({ insufficientEthFundsForTx })
}
