import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss/automationStopLossFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

interface GetAutomationStopLossFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
}

export const getAutomationStopLossFormDefaults = ({
  poolId,
  positionTriggers,
}: GetAutomationStopLossFormDefaultsParams): OmniAutomationStopLossFormState => {
  const {
    flags: { isStopLossEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers })

  return {
    action: isStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
