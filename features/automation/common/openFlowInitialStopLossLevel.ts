import type BigNumber from 'bignumber.js'
import {
  DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE,
  MIX_MAX_COL_RATIO_TRIGGER_OFFSET,
} from 'features/automation/common/consts'

export function openFlowInitialStopLossLevel({
  liquidationRatio,
}: {
  liquidationRatio: BigNumber
}) {
  const stopLossSliderMin = liquidationRatio.plus(MIX_MAX_COL_RATIO_TRIGGER_OFFSET.div(100))
  return stopLossSliderMin.plus(DEFAULT_THRESHOLD_FROM_LOWEST_POSSIBLE_SL_VALUE).times(100)
}
