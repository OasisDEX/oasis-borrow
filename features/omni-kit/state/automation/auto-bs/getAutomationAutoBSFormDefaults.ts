import { AutomationFeatures } from 'features/automation/common/types'
import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

export const getAutomationAutoBSFormDefaults = (
  positionTriggers: GetTriggersResponse,
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL,
): OmniAutomationAutoBSFormState => {
  const {
    flags: { isAutoSellEnabled, isAutoBuyEnabled },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

  const isEnabled = {
    [AutomationFeatures.AUTO_SELL]: isAutoSellEnabled,
    [AutomationFeatures.AUTO_BUY]: isAutoBuyEnabled,
  }[type]

  return {
    action: isEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
