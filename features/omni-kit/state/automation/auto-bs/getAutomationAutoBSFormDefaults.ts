import { AutomationFeatures } from 'features/automation/common/types'
import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

interface GetAutomationAutoBSFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
}

export const getAutomationAutoBSFormDefaults = ({
  poolId,
  positionTriggers,
  type,
}: GetAutomationAutoBSFormDefaultsParams): OmniAutomationAutoBSFormState => {
  const {
    flags: { isAutoSellEnabled, isAutoBuyEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers })

  const isEnabled = {
    [AutomationFeatures.AUTO_SELL]: isAutoSellEnabled,
    [AutomationFeatures.AUTO_BUY]: isAutoBuyEnabled,
  }[type]

  return {
    action: isEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
