import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import { resolveStopLossishAction } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss'
import type { AutomationMetadataValues } from 'features/omni-kit/types'
import { setupStopLoss } from 'helpers/lambda/triggers'

export const setupStopLoss = ({
  automation,
  commonPayload,
  automationState,
  debtAddress,
  collateralAddress,
}: {
  automation?: AutomationMetadataValues
  commonPayload: OmniAutomationCommonActionPayload
  automationState: OmniAutomationStopLossFormState
  debtAddress: string
  collateralAddress: string
}) => {
  const existingSLTrigger = automation?.triggers.stopLoss?.decodedMappedParams
  const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedMappedParams

  const stateTriggerLtv = automationState.triggerLtv?.times(100)
  const currentTriggerLtv = existingSLTrigger?.executionLtv?.times(100)

  const executionLTV = stateTriggerLtv || currentTriggerLtv

  if (!executionLTV) {
    console.warn('One of required action parameters missing')
    return defaultAutomationActionPromise
  }

  return setupStopLoss({
    ...commonPayload,
    executionToken: automationState.resolveTo === 'quote' ? debtAddress : collateralAddress,
    executionLTV,
    action: resolveStopLossishAction({
      action: automationState.action,
      existingSLTrigger: !!existingSLTrigger,
      existingTSLTrigger: !!existingTSLTrigger,
    }),
  })
}
