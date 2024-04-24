import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

export const getAutomationTrailingStopLossFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationTrailingStopLossFormState => {
  const {
    flags: { isTrailingStopLossEnabled },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

  return {
    action: isTrailingStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
