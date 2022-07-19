import BigNumber from 'bignumber.js'
import { zero } from 'helpers/zero'

export interface ConstantMultiplyTriggerData {
  triggerId: BigNumber
  isTriggerEnabled: boolean
}

const defaultConstantMultiplyData: ConstantMultiplyTriggerData = {
  triggerId: zero,
  isTriggerEnabled: false,
}

// TODO: extract real data based on TriggersData param that should be passed here in the future
export function extractConstantMultiplyData(): ConstantMultiplyTriggerData {
  return defaultConstantMultiplyData
}
