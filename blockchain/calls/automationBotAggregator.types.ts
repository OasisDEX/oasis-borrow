import type { TxMetaKind } from './txMeta'

export type AutomationBotAggregatorBaseTriggerData = {
  proxyAddress: string
}
export type AutomationBotAddAggregatorTriggerData = AutomationBotAggregatorBaseTriggerData & {
  groupTypeId: number
  replacedTriggerIds: any // TODO ŁW replace any https://app.shortcut.com/oazo-apps/story/5388/change-types-in-transactiondef
  triggersData: any //automationBot.types[],
  kind: TxMetaKind.addTriggerGroup
}
export type AutomationBotRemoveTriggersData = AutomationBotAggregatorBaseTriggerData & {
  triggersId: any // Property 'triggersId' is incompatible with index signature. Type 'number[]' is not assignable to type 'string | number | boolean | BigNumber | undefined'.
  removeAllowance: boolean
  kind: TxMetaKind.removeTriggers
}
