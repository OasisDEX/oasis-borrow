import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'
import { TxError } from 'helpers/types'

export function warningsBasicSellValidation({
  vault,
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
  vault: Vault
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
    token: vault.token,
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

  const autoSellTriggeredImmediately = basicSellState.execCollRatio
    .div(100)
    .gte(vault.collateralizationRatioAtNextPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    noMinSellPriceWhenStopLossEnabled,
    basicSellTriggerCloseToStopLossTrigger,
    basicSellTargetCloseToAutoBuyTrigger,
    autoSellTriggeredImmediately,
  })
}

export function errorsBasicSellValidation({
  txError,
  vault,
  ilkData,
  debtDelta,
  targetCollRatio,
  withThreshold,
  isRemoveForm,
  minSellPrice,
}: {
  txError?: TxError
  vault: Vault
  ilkData: IlkData
  debtDelta: BigNumber
  targetCollRatio: BigNumber
  withThreshold: boolean
  isRemoveForm: boolean
  minSellPrice?: BigNumber
}) {
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError })
  const targetCollRatioExceededDustLimitCollRatio =
    !targetCollRatio.isZero() && ilkData.debtFloor.gt(vault.debt.plus(debtDelta))

  const minimumSellPriceNotProvided =
    !isRemoveForm && withThreshold && (!minSellPrice || minSellPrice.isZero())

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    targetCollRatioExceededDustLimitCollRatio,
    minimumSellPriceNotProvided,
  })
}
