import type { NetworkIds } from 'blockchain/networks'
import { AutomationFeatures } from 'features/automation/common/types'
import {
  defaultAutomationActionPromise,
  setupAutoBS,
  setupPartialTakeProfit,
  setupStopLoss,
  setupTrailingStopLoss,
} from 'features/omni-kit/automation/actions'
import type { OmniAutomationCommonActionPayload } from 'features/omni-kit/automation/types'
import type {
  AutomationMetadataValues,
  OmniAutomationSimulationResponse,
} from 'features/omni-kit/contexts'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import type { LendingProtocol } from 'lendingProtocols'

export const getOmniAutomationParameters =
  ({
    automation,
    automationState,
    proxyAddress,
    collateralAddress,
    debtAddress,
    networkId,
    protocol,
    hash,
    isShort,
  }: {
    automation?: AutomationMetadataValues
    automationState: OmniAutomationFormState
    proxyAddress?: string
    collateralAddress: string
    debtAddress: string
    networkId: NetworkIds
    protocol: LendingProtocol
    hash: string
    isShort: boolean
  }) =>
  (): Promise<OmniAutomationSimulationResponse | undefined> => {
    if (!proxyAddress) {
      return defaultAutomationActionPromise
    }

    const commonPayload: OmniAutomationCommonActionPayload = {
      dpm: proxyAddress,
      networkId,
      protocol: protocol as SupportedLambdaProtocols,
      strategy: {
        collateralAddress,
        debtAddress,
      },
    }

    const resolvedUiDropdown =
      hash === 'protection'
        ? automationState.uiDropdownProtection
        : automationState.uiDropdownOptimization

    switch (resolvedUiDropdown) {
      case AutomationFeatures.STOP_LOSS:
        return setupStopLoss({
          automationState,
          automation,
          collateralAddress,
          debtAddress,
          commonPayload,
        })
      case AutomationFeatures.TRAILING_STOP_LOSS:
        return setupTrailingStopLoss({
          automationState,
          automation,
          collateralAddress,
          debtAddress,
          commonPayload,
        })
      case AutomationFeatures.AUTO_BUY:
      case AutomationFeatures.AUTO_SELL:
        return setupAutoBS({
          automationState,
          automation,
          commonPayload,
          uiDropdown: resolvedUiDropdown,
        })
      case AutomationFeatures.PARTIAL_TAKE_PROFIT:
        return setupPartialTakeProfit({
          automationState,
          automation,
          collateralAddress,
          debtAddress,
          commonPayload,
          isShort,
        })
      default:
        return defaultAutomationActionPromise
    }
  }
