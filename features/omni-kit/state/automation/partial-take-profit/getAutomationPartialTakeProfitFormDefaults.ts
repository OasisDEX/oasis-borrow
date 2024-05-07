import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'

interface GetAutomationPartialTakeProfitFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
}

export const getAutomationPartialTakeProfitFormDefaults = ({
  poolId,
  positionTriggers,
}: GetAutomationPartialTakeProfitFormDefaultsParams): OmniAutomationPartialTakeProfitFormState => {
  const {
    flags: { isPartialTakeProfitEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers })

  return {
    action: isPartialTakeProfitEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
