import { TriggerType } from '@oasisdex/automation'
import { extractBasicBSData } from 'features/automation/common/basicBSTriggerData'
import { TriggersData } from 'features/automation/protection/triggers/AutomationTriggersData'

export function extractConstantMultipleData(triggersData: TriggersData) {
  if (triggersData.triggers && triggersData.triggers.length > 0) {
    const constantMultipleTriggers = {
      [TriggerType.BasicBuy]: extractBasicBSData({
        triggersData: triggersData,
        triggerType: TriggerType.BasicBuy,
        isInGroup: true
      }),
      [TriggerType.BasicSell]: extractBasicBSData({
        triggersData: triggersData,
        triggerType: TriggerType.BasicSell,
        isInGroup: true,
      }),
    }

    return constantMultipleTriggers
  }

  return {}
}
