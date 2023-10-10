import type BigNumber from 'bignumber.js'
import type { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData.types'

import { prepareAutoBSSliderDefaults } from './prepareAutoBSSliderDefaults'
import { resolveMaxBuyOrMinSellPrice } from './resolveMaxBuyOrMinSellPrice'
import { resolveWithThreshold } from './resolveWithThreshold'

export function prepareAutoBSResetData(
  autoBSTriggersData: AutoBSTriggerData,
  positionRatio: BigNumber,
  publishKey: 'AUTO_SELL_FORM_CHANGE' | 'AUTO_BUY_FORM_CHANGE',
) {
  const defaultSliderValues = prepareAutoBSSliderDefaults({
    execCollRatio: autoBSTriggersData.execCollRatio,
    targetCollRatio: autoBSTriggersData.targetCollRatio,
    positionRatio,
    publishKey,
  })
  return {
    ...defaultSliderValues,
    maxBuyOrMinSellPrice: resolveMaxBuyOrMinSellPrice(autoBSTriggersData.maxBuyOrMinSellPrice),
    maxBaseFeeInGwei: autoBSTriggersData.maxBaseFeeInGwei,
    withThreshold: resolveWithThreshold({
      maxBuyOrMinSellPrice: autoBSTriggersData.maxBuyOrMinSellPrice,
      triggerId: autoBSTriggersData.triggerId,
    }),
    txDetails: {},
    isEditing: false,
  }
}
