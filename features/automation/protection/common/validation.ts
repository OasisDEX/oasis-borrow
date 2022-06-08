import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { slCollRatioNearLiquidationRatio } from 'features/automation/protection/controls/AdjustSlFormLayout'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

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
}: // collateralizationRatioAtNextPrice,
// currentCollateralRatio,
{
  selectedSLValue: BigNumber
  ilkData: IlkData
  txError?: TxError
  collateralizationRatioAtNextPrice: BigNumber
  currentCollateralRatio: BigNumber
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  // TODO - ŁW commennted out slRatioHigherThanCurrentOrNext for new component to not damge it, bring it back later
  const stopLossOnNearLiquidationRatio = slCollRatioNearLiquidationRatio(selectedSLValue, ilkData)
  //  ||
  // slRatioHigherThanCurrentOrNext(
  //   selectedSLValue,
  //   collateralizationRatioAtNextPrice,
  //   currentCollateralRatio,
  // )

  return errorMessagesHandler({ insufficientEthFundsForTx, stopLossOnNearLiquidationRatio })
}
