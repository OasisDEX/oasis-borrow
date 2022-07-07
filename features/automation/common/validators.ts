import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
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
  vault,
  ilkData,
  debtDelta,
  targetCollRatio,
  withThreshold,
  minSellPrice,
}: {
  txError?: TxError
  vault: Vault
  ilkData: IlkData
  debtDelta: BigNumber
  targetCollRatio: BigNumber
  withThreshold: boolean
  minSellPrice?: BigNumber
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  const targetCollRatioExceededDustLimitCollRatio =
    !targetCollRatio.isZero() && ilkData.debtFloor.gt(vault.debt.plus(debtDelta))

  const minimumSellPriceNotProvided = withThreshold && (!minSellPrice || minSellPrice.isZero())

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    targetCollRatioExceededDustLimitCollRatio,
    minimumSellPriceNotProvided,
  })
}
