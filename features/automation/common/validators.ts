import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

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
  vault,
  ilkData,
  debtDelta,
  isRemoveForm,
  basicSellState,
  autoBuyTriggerData,
}: {
  vault: Vault
  ilkData: IlkData
  debtDelta: BigNumber
  isRemoveForm: boolean
  basicSellState: BasicBSFormChange
  autoBuyTriggerData: BasicBSTriggerData
}) {
  const {
    execCollRatio,
    targetCollRatio,
    withThreshold,
    maxBuyOrMinSellPrice,
    txDetails,
  } = basicSellState
  const insufficientEthFundsForTx = ethFundsForTxValidator({
    txError: txDetails?.txError,
  })
  const targetCollRatioExceededDustLimitCollRatio =
    !targetCollRatio.isZero() && ilkData.debtFloor.gt(vault.debt.plus(debtDelta))

  const minimumSellPriceNotProvided =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoSellTriggerHigherThanAutoBuyTarget =
    autoBuyTriggerData.isTriggerEnabled &&
    execCollRatio.plus(5).gt(autoBuyTriggerData.targetCollRatio)

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    targetCollRatioExceededDustLimitCollRatio,
    minimumSellPriceNotProvided,
    autoSellTriggerHigherThanAutoBuyTarget,
  })
}
