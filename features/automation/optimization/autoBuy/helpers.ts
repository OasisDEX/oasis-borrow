import type BigNumber from 'bignumber.js'
import {
  DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'

export function getAutoBuyMinMaxValues({
  liquidationRatio,
  autoSellTriggerData,
  stopLossTriggerData,
}: {
  liquidationRatio: BigNumber
  autoSellTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  if (autoSellTriggerData.isTriggerEnabled && stopLossTriggerData.isStopLossEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
    }
  }

  if (autoSellTriggerData.isTriggerEnabled) {
    return {
      min: autoSellTriggerData.execCollRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
    }
  }

  if (stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
    }
  }

  return {
    min: liquidationRatio.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    max: DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
  }
}
