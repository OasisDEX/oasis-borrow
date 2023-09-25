import { zero } from 'helpers/zero'

import type { StopLossTriggerData } from './stopLossTriggerData.types'

export const defaultStopLossData = {
  isStopLossEnabled: false,
  stopLossLevel: zero,
  triggerId: zero,
  isToCollateral: false,
  executionParams: '0x',
} as StopLossTriggerData
