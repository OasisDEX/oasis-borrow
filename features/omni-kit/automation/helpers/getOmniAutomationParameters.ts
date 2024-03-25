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
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { SupportedLambdaProtocols } from 'helpers/triggers'
import type { LendingProtocol } from 'lendingProtocols'

export type OmniGetAutomationDataParams =
  | {
      activeUiDropdown: AutomationFeatures.AUTO_SELL
      automationState: OmniAutomationAutoBSFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.AUTO_BUY
      automationState: OmniAutomationAutoBSFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.STOP_LOSS
      automationState: OmniAutomationStopLossFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.TRAILING_STOP_LOSS
      automationState: OmniAutomationTrailingStopLossFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.PARTIAL_TAKE_PROFIT
      automationState: OmniAutomationPartialTakeProfitFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.AUTO_TAKE_PROFIT
      automationState: OmniAutomationPartialTakeProfitFormState
    }
  | {
      activeUiDropdown: AutomationFeatures.CONSTANT_MULTIPLE
      automationState: OmniAutomationPartialTakeProfitFormState
    }

export const getOmniAutomationParameters =
  ({
    automation,
    proxyAddress,
    collateralAddress,
    debtAddress,
    networkId,
    protocol,
    isShort,
    data,
  }: {
    automation?: AutomationMetadataValues
    proxyAddress?: string
    collateralAddress: string
    debtAddress: string
    networkId: NetworkIds
    protocol: LendingProtocol
    isShort: boolean
    data: OmniGetAutomationDataParams
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

    const { activeUiDropdown, automationState } = data

    switch (activeUiDropdown) {
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
          uiDropdown: activeUiDropdown,
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
