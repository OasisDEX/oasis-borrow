import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsBasicSellValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMin,
  sliderMax,
  minSellPrice,
  isStopLossEnabled,
  isAutoBuyEnabled,
  basicSellState,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  sliderMax: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoBuyEnabled: boolean
  basicSellState: BasicBSFormChange
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

  const basicSellTriggerCloseToStopLossTrigger =
    isStopLossEnabled && basicSellState.execCollRatio.isEqualTo(sliderMin)
  const basicSellTargetCloseToAutoBuyTrigger =
    isAutoBuyEnabled && basicSellState.targetCollRatio.isEqualTo(sliderMax)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    noMinSellPriceWhenStopLossEnabled,
    basicSellTriggerCloseToStopLossTrigger,
    basicSellTargetCloseToAutoBuyTrigger,
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

export function errorsAddBasicBuyValidation({
  txError,
  maxBuyPrice,
  withThreshold,
}: {
  txError?: TxError
  maxBuyPrice?: BigNumber
  withThreshold: boolean
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })

  const autoBuyMaxBuyPriceNotSpecified = withThreshold && (!maxBuyPrice || maxBuyPrice.isZero())
  return errorMessagesHandler({ insufficientEthFundsForTx, autoBuyMaxBuyPriceNotSpecified })
}

export function warningsBasicBuyValidation({
  token,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  withThreshold,
}: {
  token: string
  ethBalance: BigNumber
  ethPrice: BigNumber
  gasEstimationUsd?: BigNumber
  withThreshold: boolean
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const settingAutoBuyTriggerWithNoThreshold = !withThreshold

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
  })
}
