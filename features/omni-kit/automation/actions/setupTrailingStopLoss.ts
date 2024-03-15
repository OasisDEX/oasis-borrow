import BigNumber from 'bignumber.js'
import { defaultAutomationActionPromise } from 'features/omni-kit/automation/actions/common'
import { resolveStopLossishAction } from 'features/omni-kit/automation/helpers'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type { AutomationMetadataValues } from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import { setupAaveLikeTrailingStopLoss } from 'helpers/triggers'

export const setupTrailingStopLoss = ({
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
  const existingSLTrigger_tsl = automation?.triggers.stopLoss?.decodedParams
  const existingTSLTrigger_tsl = automation?.triggers.trailingStopLoss?.decodedParams

  const stateTrailingDistance = automationState.trailingDistance
  const currentTrailingDistance = existingTSLTrigger_tsl?.trailingDistance
    ? new BigNumber(existingTSLTrigger_tsl.trailingDistance)
    : undefined

  const trailingDistance = stateTrailingDistance || currentTrailingDistance

  if (!trailingDistance) {
    console.warn('One of required action parameters missing')
    return defaultAutomationActionPromise
  }

  return setupAaveLikeTrailingStopLoss({
    ...commonPayload,
    executionToken:
      automationState.resolveTo === 'quote' ||
      automation?.triggers.stopLoss?.triggerTypeName.includes('Debt')
        ? debtAddress
        : collateralAddress,
    trailingDistance,
    action: resolveStopLossishAction({
      action: automationState.action,
      existingSLTrigger: !!existingSLTrigger_tsl,
      existingTSLTrigger: !!existingTSLTrigger_tsl,
    }),
  })
}
