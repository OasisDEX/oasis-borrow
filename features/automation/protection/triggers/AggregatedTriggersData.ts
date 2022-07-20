// TODO async function loadTriggerDataFromCache ?

export interface AggregatedTriggerRecord {
  groupId: number
  groupTypeId: 1
  triggerIds: number[]
}

export interface AggregtedTriggersData {
  // isAutomationEnabled: boolean // TODO will we need it here ?
  triggers?: AggregatedTriggerRecord[]
}
