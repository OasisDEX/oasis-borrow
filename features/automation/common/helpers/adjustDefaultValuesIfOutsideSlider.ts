import type BigNumber from 'bignumber.js'
import {
  AUTO_BUY_FORM_CHANGE,
  AUTO_SELL_FORM_CHANGE,
} from 'features/automation/common/state/autoBSFormChange.constants'
import type { AutoBSFormChange } from 'features/automation/common/state/autoBSFormChange.types'
import type { UIChanges } from 'helpers/uiChanges.types'

export function adjustDefaultValuesIfOutsideSlider({
  autoBSState,
  sliderMin,
  sliderMax,
  uiChanges,
  publishType,
}: {
  autoBSState: AutoBSFormChange
  sliderMin: BigNumber
  sliderMax: BigNumber
  uiChanges: UIChanges
  publishType: typeof AUTO_SELL_FORM_CHANGE | typeof AUTO_BUY_FORM_CHANGE
}) {
  const sliderValuesMap = {
    [AUTO_BUY_FORM_CHANGE]: { targetCollRatio: sliderMin, execCollRatio: sliderMin.plus(5) },
    [AUTO_SELL_FORM_CHANGE]: { targetCollRatio: sliderMin.plus(5), execCollRatio: sliderMin },
  }

  if (
    autoBSState.targetCollRatio.lt(sliderMin) ||
    autoBSState.targetCollRatio.gt(sliderMax) ||
    autoBSState.execCollRatio.gt(sliderMax) ||
    autoBSState.execCollRatio.lt(sliderMin)
  ) {
    uiChanges.publish(publishType, {
      type: 'target-coll-ratio',
      targetCollRatio: sliderValuesMap[publishType].targetCollRatio,
    })
    uiChanges.publish(publishType, {
      type: 'execution-coll-ratio',
      execCollRatio: sliderValuesMap[publishType].execCollRatio,
    })
  }
}
