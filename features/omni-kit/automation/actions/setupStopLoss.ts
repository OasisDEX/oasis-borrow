import BigNumber from 'bignumber.js'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import { resolveStopLossishAction } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { AutomationMetadataValues } from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import { setupAaveLikeStopLoss } from 'helpers/triggers'

export const setupStopLoss = ({
  automation,
  commonPayload,
  automationState,
  debtAddress,
  collateralAddress,
}: {
  automation?: AutomationMetadataValues
  commonPayload: OmniAutomationCommonActionPayload
  automationState: OmniAutomationFormState
  debtAddress: string
  collateralAddress: string
}) => {
  const existingSLTrigger = automation?.triggers.stopLoss?.decodedParams
  const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedParams

  const stateTriggerLtv = automationState.triggerLtv?.times(100)
  const currentTriggerLtv = existingSLTrigger?.executionLtv
    ? new BigNumber(existingSLTrigger.executionLtv)
    : undefined

  const executionLTV = stateTriggerLtv || currentTriggerLtv

  if (!executionLTV) {
    return defaultAutomationActionPromise
  }

  return setupAaveLikeStopLoss({
    ...commonPayload,
    executionToken:
      automationState.resolveTo === 'quote' ||
      automation?.triggers.stopLoss?.triggerTypeName.includes('Debt')
        ? debtAddress
        : collateralAddress,
    executionLTV,
    action: resolveStopLossishAction({
      action: automationState.action,
      existingSLTrigger: !!existingSLTrigger,
      existingTSLTrigger: !!existingTSLTrigger,
    }),
  })
}
