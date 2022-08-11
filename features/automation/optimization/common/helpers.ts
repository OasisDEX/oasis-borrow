import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { resolveMaxBuyOrMinSellPrice } from 'features/automation/common/helpers'
import { ConstantMultipleTriggerData } from 'features/automation/optimization/common/constantMultipleTriggerData'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
import { getBasicSellMinMaxValues } from 'features/automation/protection/common/helpers'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { ConstantMultipleFormChange } from 'features/automation/protection/common/UITypes/constantMultipleFormChange'

export function getConstantMutliplyMinMaxValues({
  ilkData,
  autoBuyTriggerData,
  stopLossTriggerData,
  lockedCollateralUSD,
}: {
  ilkData: IlkData
  autoBuyTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
  lockedCollateralUSD: BigNumber
}) {
  return {
    min: getBasicSellMinMaxValues({
      autoBuyTriggerData,
      stopLossTriggerData,
      ilkData,
    }).min,
    max: BigNumber.minimum(
      lockedCollateralUSD.div(ilkData.debtFloor),
      DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    )
      .times(100)
      .decimalPlaces(0, BigNumber.ROUND_DOWN),
  }
}

export function checkIfEditingConstantMultiple({
  triggerData,
  state,
}: {
  triggerData: ConstantMultipleTriggerData
  state: ConstantMultipleFormChange
}) {
  const resolvedMaxBuyPrice = resolveMaxBuyOrMinSellPrice(triggerData.maxBuyPrice)
  const resolvedMinSellPrice = resolveMaxBuyOrMinSellPrice(triggerData.minSellPrice)

  return (
    (!triggerData.isTriggerEnabled && state.isEditing) ||
    (triggerData.isTriggerEnabled &&
      (!triggerData.buyExecutionCollRatio.isEqualTo(state.buyExecutionCollRatio) ||
        !triggerData.sellExecutionCollRatio.isEqualTo(state.sellExecutionCollRatio) ||
        !triggerData.targetCollRatio.isEqualTo(state.targetCollRatio) ||
        !triggerData.maxBaseFeeInGwei.isEqualTo(state.maxBaseFeeInGwei) ||
        resolvedMaxBuyPrice?.toNumber() !== state.maxBuyPrice?.toNumber() ||
        resolvedMinSellPrice?.toNumber() !== state.minSellPrice?.toNumber()))
  )
}
