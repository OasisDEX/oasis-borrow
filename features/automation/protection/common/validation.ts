import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { slCollRatioNearLiquidationRatio } from 'features/automation/protection/controls/AdjustSlFormLayout'
import {
  ethFundsForTxValidator,
  notEnoughETHtoPayForTx,
  stopLossCloseToCollRatioValidator,
} from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  selectedSLValue,
  currentCollateralRatio,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  selectedSLValue: BigNumber
  currentCollateralRatio: BigNumber
  gasEstimationUsd?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const currentCollRatioCloseToStopLoss = stopLossCloseToCollRatioValidator({
    stopLossLevel: selectedSLValue,
    currentCollRatio: currentCollateralRatio,
  })

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    currentCollRatioCloseToStopLoss,
  })
}

export function errorsValidation({
  txError,
  selectedSLValue,
  ilkData,
}: {
  selectedSLValue: BigNumber
  ilkData: IlkData
  txError?: TxError
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  const stopLossOnNearLiquidationRatio = slCollRatioNearLiquidationRatio(selectedSLValue, ilkData)

  return errorMessagesHandler({ insufficientEthFundsForTx, stopLossOnNearLiquidationRatio })
}
