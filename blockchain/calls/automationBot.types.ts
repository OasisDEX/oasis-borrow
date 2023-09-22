import type { TriggerType } from '@oasisdex/automation'
import type BigNumber from 'bignumber.js'

import type { TxMetaKind } from './txMeta'

export type AutomationBaseTriggerData = {
  cdpId: BigNumber
  triggerType: TriggerType
  triggerData: string
  proxyAddress: string
}

export type AutomationBotAddTriggerData = AutomationBaseTriggerData & {
  kind: TxMetaKind.addTrigger
  replacedTriggerId: number
}
// any's below because TxMeta is somehow not compatible with arrays

export type AutomationBotV2AddTriggerData = {
  kind: TxMetaKind.addTrigger
  proxyAddress: string
  replacedTriggerIds: any // BigNumber[]
  replacedTriggersData: any // string[]
  triggersData: any // string[]
  triggerTypes: any // number[]
  continuous: any // boolean[]
}

export type AutomationBotV2RemoveTriggerData = {
  kind: TxMetaKind.removeTriggers
  proxyAddress: string
  triggersIds: any // number[]
  triggersData: any // string[]
  removeAllowance: boolean
}
