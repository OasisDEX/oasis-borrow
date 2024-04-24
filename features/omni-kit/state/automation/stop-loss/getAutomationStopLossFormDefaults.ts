import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss/automationStopLossFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

export const getAutomationStopLossFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationStopLossFormState => {
  const {
    flags: { isStopLossEnabled },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

  return {
    action: isStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
