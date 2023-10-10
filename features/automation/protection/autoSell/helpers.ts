import type BigNumber from 'bignumber.js'
import {
  DEFAULT_AUTO_BS_MAX_SLIDER_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'

export function getAutoSellMinMaxValues({
  liquidationRatio,
  autoBuyTriggerData,
  stopLossTriggerData,
}: {
  liquidationRatio: BigNumber
  autoBuyTriggerData: AutoBSTriggerData
  stopLossTriggerData: StopLossTriggerData
}) {
  if (autoBuyTriggerData.isTriggerEnabled && stopLossTriggerData.isStopLossEnabled) {
    return {
      min: stopLossTriggerData.stopLossLevel.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: autoBuyTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
    }
  }

  if (autoBuyTriggerData.isTriggerEnabled) {
    return {
      min: liquidationRatio.times(100).plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
      max: autoBuyTriggerData.execCollRatio.minus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET),
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
