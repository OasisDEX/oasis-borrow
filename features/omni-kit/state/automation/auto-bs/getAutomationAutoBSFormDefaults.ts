import { AutomationFeatures } from 'features/automation/common/types'
import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { GetTriggersResponse } from 'helpers/triggers'
import { TriggerAction } from 'helpers/triggers'

export const getAutomationAutoBSFormDefaults = (
  positionTriggers: GetTriggersResponse,
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL,
): OmniAutomationAutoBSFormState => {
  const {
    // triggers: { autoBuy, autoSell },
    flags: { isAutoSellEnabled, isAutoBuyEnabled },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

  const isEnabled = {
    [AutomationFeatures.AUTO_SELL]: isAutoSellEnabled,
    [AutomationFeatures.AUTO_BUY]: isAutoBuyEnabled,
  }[type]

  // const trigger = {
  //   [AutomationFeatures.AUTO_SELL]: autoSell,
  //   [AutomationFeatures.AUTO_BUY]: autoBuy,
  // }[type]

  return {
    action: isEnabled ? TriggerAction.Update : TriggerAction.Add,
    useThreshold: true, // TODO
  }
}
