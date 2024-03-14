import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import { resolveStopLossishAction } from 'features/omni-kit/automation/helpers/resolveStopLossishAction'
import type {
  AutomationMetadataValues,
  OmniAutomationSimulationResponse,
} from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import { setupAaveLikeStopLoss } from 'helpers/triggers'
import { setupAaveLikeTrailingStopLoss } from 'helpers/triggers/setup-triggers/setup-aave-trailing-stop-loss'
import type { LendingProtocol } from 'lendingProtocols'

const defaultPromise = Promise.resolve<OmniAutomationSimulationResponse | undefined>(undefined)

export const getOmniAutomationParameters = ({
  automation,
  automationState,
  proxyAddress,
  collateralAddress,
  debtAddress,
  networkId,
  protocol,
}: {
  automation?: AutomationMetadataValues
  automationState: OmniAutomationFormState
  proxyAddress?: string
  collateralAddress: string
  debtAddress: string
  networkId: NetworkIds
  protocol: LendingProtocol
}): (() => Promise<OmniAutomationSimulationResponse | undefined>) => {
  if (!proxyAddress) {
    return () => defaultPromise
  }

  const commonPayload = {
    dpm: proxyAddress,
    networkId,
    protocol: protocol as SupportedLambdaProtocols,
    strategy: {
      collateralAddress,
      debtAddress,
    },
  }

  switch (automationState.uiDropdownProtection) {
    case AutomationFeatures.STOP_LOSS:
      const existingSLTrigger_sl = automation?.triggers.stopLoss?.decodedParams
      const existingTSLTrigger_sl = automation?.triggers.trailingStopLoss?.decodedParams

      // TODO I had to multiply it by 100 here
      const stateTriggerLtv = automationState.triggerLtv?.times(100)
      const currentTriggerLtv = existingSLTrigger_sl?.executionLtv
        ? new BigNumber(existingSLTrigger_sl.executionLtv)
        : undefined

      const executionLTV = stateTriggerLtv || currentTriggerLtv

      if (!executionLTV) {
        return () => defaultPromise
      }

      return () =>
        setupAaveLikeStopLoss({
          ...commonPayload,
          executionToken:
            automationState.resolveTo === 'quote' ||
            automation?.triggers.stopLoss?.triggerTypeName.includes('Debt')
              ? debtAddress
              : collateralAddress,
          executionLTV,
          action: resolveStopLossishAction({
            action: automationState.action,
            existingSLTrigger: !!existingSLTrigger_sl,
            existingTSLTrigger: !!existingTSLTrigger_sl,
          }),
        })
    case AutomationFeatures.TRAILING_STOP_LOSS:
      const existingSLTrigger_tsl = automation?.triggers.stopLoss?.decodedParams
      const existingTSLTrigger_tsl = automation?.triggers.trailingStopLoss?.decodedParams

      const stateTrailingDistance = automationState.trailingDistance
      const currentTrailingDistance = existingTSLTrigger_tsl?.trailingDistance
        ? new BigNumber(existingTSLTrigger_tsl.trailingDistance)
        : undefined

      const trailingDistance = stateTrailingDistance || currentTrailingDistance

      if (!trailingDistance) {
        return () => defaultPromise
      }

      return () =>
        setupAaveLikeTrailingStopLoss({
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
    default:
      return () => defaultPromise
  }
}
