import { getMappedAutomationMetadataValues } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { GetTriggersResponse } from 'helpers/lambda/triggers'
import { TriggerAction } from 'helpers/lambda/triggers'
import type { LendingProtocol } from 'lendingProtocols'

interface GetAutomationTrailingStopLossFormDefaultsParams {
  poolId?: string
  positionTriggers: GetTriggersResponse
  protocol: LendingProtocol
}

export const getAutomationTrailingStopLossFormDefaults = ({
  positionTriggers,
  poolId,
  protocol,
}: GetAutomationTrailingStopLossFormDefaultsParams): OmniAutomationTrailingStopLossFormState => {
  const {
    flags: { isTrailingStopLossEnabled },
  } = getMappedAutomationMetadataValues({ poolId, positionTriggers, protocol })

  return {
    action: isTrailingStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
