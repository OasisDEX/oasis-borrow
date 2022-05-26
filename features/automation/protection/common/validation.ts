import BigNumber from 'bignumber.js'

import { IlkData } from '../../../../blockchain/ilks'
import { TxError } from '../../../../helpers/types'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from '../../../form/commonValidators'
import { errorMessagesHandler } from '../../../form/errorMessagesHandler'
import { warningMessagesHandler } from '../../../form/warningMessagesHandler'
import { slCollRatioNearLiquidationRatio } from '../controls/AdjustSlFormLayout'

export function warningsValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  selectedSLValue,
  collateralizationRatioAtNextPrice,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  selectedSLValue: BigNumber
  collateralizationRatioAtNextPrice: BigNumber
  gasEstimationUsd?: BigNumber
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const nextCollateralizationPriceAlertRange = 3
  const nextCollateralizationPriceFloor = collateralizationRatioAtNextPrice
    .times(100)
    .decimalPlaces(0)
    .minus(nextCollateralizationPriceAlertRange)

  const nextCollRatioCloseToCurrentSl = selectedSLValue.gte(nextCollateralizationPriceFloor)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    nextCollRatioCloseToCurrentSl,
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
