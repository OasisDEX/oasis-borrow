import { AutomationFeatures } from 'features/automation/common/types'
import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationAutoBSFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  type: AutomationFeatures.AUTO_BUY | AutomationFeatures.AUTO_SELL
  protocol: LendingProtocol
}

export const getAutomationAutoBSFormDefaults = ({
  poolId,
  positionTriggers,
  type,
  protocol,
}: GetAutomationAutoBSFormDefaultsParams): OmniAutomationAutoBSFormState => {
  const {
    flags: { isAutoSellEnabled, isAutoBuyEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers, protocol })

  const isEnabled = {
    [AutomationFeatures.AUTO_SELL]: isAutoSellEnabled,
    [AutomationFeatures.AUTO_BUY]: isAutoBuyEnabled,
  }[type]

  return {
    action: isEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
