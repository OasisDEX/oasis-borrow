import { decodeTriggerData, TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import { NetworkIds } from 'blockchain/network'
import { TriggerRecord } from 'features/automation/protection/triggers/AutomationTriggersData'

export function getTriggersByType(triggers: TriggerRecord[], triggerTypes: TriggerType[]) {
  const networkId = getNetworkId() === NetworkIds.GOERLI ? NetworkIds.GOERLI : NetworkIds.MAINNET

  try {
    const decodedTriggers = triggers.map((trigger) => {
      return {
        triggerId: trigger.triggerId,
        result: decodeTriggerData(trigger.commandAddress, networkId, trigger.executionParams),
      }
    })

    return decodedTriggers.filter((decodedTrigger) => {
      const triggerType = decodedTrigger.result[1]

      return triggerTypes.includes(triggerType)
    })
  } catch (e) {
    console.error(e)
    return []
  }
}
