import { decodeTriggerData, TriggerType } from '@oasisdex/automation'
import { getNetworkId } from '@oasisdex/web3-context'
import { TriggerRecord } from 'features/automation/protection/triggers/AutomationTriggersData'

export function getTriggersByType(triggers: TriggerRecord[], triggerTypes: TriggerType[]) {
  const MAINNET_ID = 1
  const GOERLI_ID = 5

  const networkId = getNetworkId() === GOERLI_ID ? GOERLI_ID : MAINNET_ID

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
