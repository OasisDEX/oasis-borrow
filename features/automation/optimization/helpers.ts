import { IlkData } from 'blockchain/ilks'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'

export function getBasicBuyMinMaxValues({
  ilkData,
  autoSellTriggerData,
  stopLossTriggerData,
}: {
  ilkData: IlkData
  autoSellTriggerData: BasicBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  if (autoSellTriggerData.isTriggerEnabled && stopLossTriggerData.isStopLossEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    }
  }

  if (autoSellTriggerData.isTriggerEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    }
  }

  if (stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
    }
  }

  return {
    min: ilkData.liquidationRatio.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    max: DEFAULT_BASIC_BS_MAX_SLIDER_VALUE,
  }
}
