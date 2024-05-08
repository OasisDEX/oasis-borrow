import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

interface GetAutomationTrailingStopLossFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
}

export const getAutomationTrailingStopLossFormDefaults = ({
  positionTriggers,
  poolId,
}: GetAutomationTrailingStopLossFormDefaultsParams): OmniAutomationTrailingStopLossFormState => {
  const {
    flags: { isTrailingStopLossEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers })

  return {
    action: isTrailingStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
