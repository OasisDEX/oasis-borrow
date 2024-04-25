import BigNumber from 'bignumber.js'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import { resolveStopLossishAction } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { AutomationMetadataValues } from 'features/omni-kit/types'
import { setupAaveLikeTrailingStopLoss } from 'helpers/lambda/triggers'

export const setupTrailingStopLoss = ({
  automation,
  commonPayload,
  automationState,
  debtAddress,
  collateralAddress,
}: {
  automation?: AutomationMetadataValues
  commonPayload: OmniAutomationCommonActionPayload
  automationState: OmniAutomationTrailingStopLossFormState
  debtAddress: string
  collateralAddress: string
}) => {
  const existingSLTrigger = automation?.triggers.stopLoss?.decodedParams
  const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedParams

  const stateTrailingDistance = automationState.trailingDistance
  const currentTrailingDistance = existingTSLTrigger?.trailingDistance
    ? new BigNumber(existingTSLTrigger.trailingDistance)
    : undefined

  const trailingDistance = stateTrailingDistance || currentTrailingDistance

  if (!trailingDistance) {
    console.warn('One of required action parameters missing')
    return defaultAutomationActionPromise
  }

  return setupAaveLikeTrailingStopLoss({
    ...commonPayload,
    executionToken: automationState.resolveTo === 'quote' ? debtAddress : collateralAddress,
    trailingDistance,
    action: resolveStopLossishAction({
      action: automationState.action,
      existingSLTrigger: !!existingSLTrigger,
      existingTSLTrigger: !!existingTSLTrigger,
    }),
  })
}
