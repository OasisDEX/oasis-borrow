import { getAaveLikeAutomationMetadataValues } from 'features/omni-kit/protocols/aave-like/helpers'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { GetTriggersResponse } from 'helpers/triggers'
import { TriggerAction } from 'helpers/triggers'

export const getAutomationTrailingStopLossFormDefaults = (
  positionTriggers: GetTriggersResponse,
): OmniAutomationTrailingStopLossFormState => {
  const {
    triggers: { trailingStopLoss },
    flags: { isTrailingStopLossEnabled },
  } = getAaveLikeAutomationMetadataValues({ positionTriggers })

  return {
    resolveTo: trailingStopLoss?.triggerTypeName.includes('Debt') ? 'quote' : 'collateral',
    action: isTrailingStopLossEnabled ? TriggerAction.Update : TriggerAction.Add,
  }
}
