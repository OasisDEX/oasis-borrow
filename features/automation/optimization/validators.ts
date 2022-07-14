import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { BasicBSFormChange } from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { ethFundsForTxValidator, notEnoughETHtoPayForTx } from 'features/form/commonValidators'
import { errorMessagesHandler } from 'features/form/errorMessagesHandler'
import { warningMessagesHandler } from 'features/form/warningMessagesHandler'

export function warningsBasicBuyValidation({
  vault,
  gasEstimationUsd,
  ethBalance,
  ethPrice,
  sliderMin,
  isStopLossEnabled,
  isAutoSellEnabled,
  basicBuyState,
  withThreshold,
}: {
  vault: Vault
  ethBalance: BigNumber
  ethPrice: BigNumber
  sliderMin: BigNumber
  gasEstimationUsd?: BigNumber
  isStopLossEnabled: boolean
  isAutoSellEnabled: boolean
  basicBuyState: BasicBSFormChange
  minSellPrice?: BigNumber
  withThreshold: boolean
}) {
  const potentialInsufficientEthFundsForTx = notEnoughETHtoPayForTx({
    token: vault.token,
    gasEstimationUsd,
    ethBalance,
    ethPrice,
  })

  const autoBuyTargetCloseToStopLossTrigger =
    isStopLossEnabled && !isAutoSellEnabled && basicBuyState.targetCollRatio.isEqualTo(sliderMin)

  const autoBuyTargetCloseToAutoSellTrigger =
    isAutoSellEnabled && basicBuyState.targetCollRatio.isEqualTo(sliderMin)

  const settingAutoBuyTriggerWithNoThreshold = !withThreshold

  const autoBuyTriggeredImmediately = basicBuyState.execCollRatio
    .div(100)
    .lte(vault.collateralizationRatioAtNextPrice)

  return warningMessagesHandler({
    potentialInsufficientEthFundsForTx,
    settingAutoBuyTriggerWithNoThreshold,
    autoBuyTargetCloseToStopLossTrigger,
    autoBuyTargetCloseToAutoSellTrigger,
    autoBuyTriggeredImmediately,
  })
}

export function errorsBasicBuyValidation({
  basicBuyState,
  autoSellTriggerData,
  isRemoveForm,
}: {
  basicBuyState: BasicBSFormChange
  autoSellTriggerData: BasicBSTriggerData
  isRemoveForm: boolean
}) {
  const { maxBuyOrMinSellPrice, txDetails, withThreshold, execCollRatio } = basicBuyState
  const insufficientEthFundsForTx = ethFundsForTxValidator({ txError: txDetails?.txError })

  const autoBuyMaxBuyPriceNotSpecified =
    !isRemoveForm && withThreshold && (!maxBuyOrMinSellPrice || maxBuyOrMinSellPrice.isZero())

  const autoBuyTriggerLowerThanAutoSellTarget =
    autoSellTriggerData.isTriggerEnabled &&
    execCollRatio.minus(5).lt(autoSellTriggerData.targetCollRatio)

  return errorMessagesHandler({
    insufficientEthFundsForTx,
    autoBuyMaxBuyPriceNotSpecified,
    autoBuyTriggerLowerThanAutoSellTarget,
  })
}
