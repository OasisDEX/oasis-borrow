import { getAaveLikeAutomationMetadataCommonValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

export const getAutomationPartialTakeProfitFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationPartialTakeProfitFormState => {
  const {
    flags: { isPartialTakeProfitEnabled },
  } = getAaveLikeAutomationMetadataCommonValues({ positionTriggers })

  return {
    action: isPartialTakeProfitEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
