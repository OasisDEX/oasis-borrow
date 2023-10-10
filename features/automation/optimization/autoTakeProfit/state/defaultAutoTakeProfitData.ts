import { zero } from 'helpers/zero'

import type { AutoTakeProfitTriggerData } from './autoTakeProfitTriggerData.types'

export const defaultAutoTakeProfitData: AutoTakeProfitTriggerData = {
  executionPrice: zero,
  isToCollateral: true,
  isTriggerEnabled: false,
  maxBaseFeeInGwei: zero,
  triggerId: zero,
}
