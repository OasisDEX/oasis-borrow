import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss/automationStopLossFormReducto.types'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationStopLossFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const getAutomationStopLossFormDefaults = ({
  poolId,
  positionTriggers,
  protocol,
}: GetAutomationStopLossFormDefaultsParams): OmniAutomationStopLossFormState => {
  const {
    flags: { isStopLossEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers, protocol })

  return {
    action: isStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
