import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationPartialTakeProfitFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const getAutomationPartialTakeProfitFormDefaults = ({
  poolId,
  positionTriggers,
  protocol,
}: GetAutomationPartialTakeProfitFormDefaultsParams): OmniAutomationPartialTakeProfitFormState => {
  const {
    flags: { isPartialTakeProfitEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers, protocol })

  return {
    action: isPartialTakeProfitEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
