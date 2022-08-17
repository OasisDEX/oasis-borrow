import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { DEFAULT_BASIC_BS_MAX_SLIDER_VALUE } from 'features/automation/protection/common/consts/automationDefaults'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'

export function getBasicBuyMinMaxValues({
  ilkData,
  lockedCollateralUSD,
  autoSellTriggerData,
  stopLossTriggerData,
}: {
  ilkData: IlkData
  lockedCollateralUSD: BigNumber
  autoSellTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  const max = BigNumber.minimum(
    lockedCollateralUSD.div(ilkData.debtFloor),
    DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  )
    .times(100)
    .decimalPlaces(0, BigNumber.ROUND_DOWN)

  if (autoSellTriggerData.isTriggerEnabled && stopLossTriggerData.isStopLossEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(5),
      max,
    }
  }

  if (autoSellTriggerData.isTriggerEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(5),
      max,
    }
  }

  if (stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(5),
      max,
    }
  }

  return {
    min: ilkData.liquidationRatio.times(100).plus(5),
    max,
  }
}
