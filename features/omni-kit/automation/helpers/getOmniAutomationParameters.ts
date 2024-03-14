import BigNumber from 'bignumber.js'
import type { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import type {
  AutomationMetadataValues,
  OmniAutomationSimulationResponse,
} from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import { setupAaveLikeStopLoss, TriggerAction } from 'helpers/triggers'
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
      const existingSLTrigger = automation?.triggers.stopLoss?.decodedParams
      const existingTSLTrigger = automation?.triggers.trailingStopLoss?.decodedParams

      // TODO I had to multiply it by 100 here
      const stateTriggerLtv = automationState.triggerLtv?.times(100)
      const currentTriggerLtv = existingSLTrigger?.executionLtv
        ? new BigNumber(existingSLTrigger.executionLtv)
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
          action:
            existingSLTrigger || existingTSLTrigger ? TriggerAction.Update : TriggerAction.Add,
        })
    default:
      return () => defaultPromise
  }
}
