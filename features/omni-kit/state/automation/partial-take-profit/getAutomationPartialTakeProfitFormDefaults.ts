import { getAaveLikeAutomationMetadataValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { GetTriggersResponse } from 'helpers/triggers'
import { TriggerAction } from 'helpers/triggers'

export const getAutomationPartialTakeProfitFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationPartialTakeProfitFormState => {
  const {
    triggers: { partialTakeProfit },
    flags: { isPartialTakeProfitEnabled },
  } = getAaveLikeAutomationMetadataValues({ positionTriggers })

  return {
    action: isPartialTakeProfitEnabled ? TriggerAction.Update : TriggerAction.Add,
    resolveTo: partialTakeProfit?.decodedParams.withdrawToDebt === 'true' ? 'quote' : 'collateral',
  }
}
