import { DEFAULT_DEVIATION, DEFAULT_MAX_BASE_FEE_IN_GWEI } from 'features/automation/common/consts'
import { zero } from 'helpers/zero'

import type { ConstantMultipleTriggerData } from './constantMultipleTriggerData.types'

export const defaultConstantMultipleData: ConstantMultipleTriggerData = {
  triggersId: [zero, zero],
  buyExecutionCollRatio: zero,
  sellExecutionCollRatio: zero,
  targetCollRatio: zero,
  maxBuyPrice: zero,
  minSellPrice: zero,
  continuous: false,
  deviation: DEFAULT_DEVIATION,
  maxBaseFeeInGwei: DEFAULT_MAX_BASE_FEE_IN_GWEI,
  isTriggerEnabled: false,
}
