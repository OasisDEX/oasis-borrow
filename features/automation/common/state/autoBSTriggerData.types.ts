import type { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'
import type { TriggersData } from 'features/automation/api/automationTriggersData.types'

export interface AutoBSTriggerData {
  triggerId: BigNumber
  execCollRatio: BigNumber
  targetCollRatio: BigNumber
  maxBuyOrMinSellPrice: BigNumber
  continuous: boolean
  deviation: BigNumber
  maxBaseFeeInGwei: BigNumber
  isTriggerEnabled: boolean
}
export interface ExtractAutoBSDataProps {
  triggersData: TriggersData
  triggerType: TriggerType
  isInGroup?: boolean
}
