import type { TriggerType } from '@oasisdex/automation'
import { decodeTriggerDataAsJson } from '@oasisdex/automation'
import type { NetworkIds } from 'blockchain/networks'
import type { TriggerRecord } from 'features/automation/api/automationTriggersData.types'
import type { TriggerDataType } from 'features/automation/common/TriggerDataType'

export function getTriggersByType(
  triggers: TriggerRecord[],
  triggerTypes: TriggerType[],
  networkId: NetworkIds,
): TriggerDataType[] {
  try {
    const decodedTriggers = triggers.map((trigger) => {
      const result = decodeTriggerDataAsJson(
        trigger.commandAddress,
        networkId,
        trigger.executionParams,
      )

      return {
        triggerId: trigger.triggerId,
        result,
        executionParams: trigger.executionParams,
        commandAddress: trigger.commandAddress,
      }
    })

    return decodedTriggers.filter((decodedTrigger) => {
      const triggerType = Number(decodedTrigger.result.triggerType)
      return triggerTypes.includes(triggerType)
    })
  } catch (e) {
    console.error(e)
    return []
  }
}
