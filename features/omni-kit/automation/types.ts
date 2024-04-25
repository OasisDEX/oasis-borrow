import type { NetworkIds } from 'blockchain/networks'
import type { OmniAutomationAutoBSFormState } from 'features/omni-kit/state/automation/auto-bs'
import type { OmniAutomationFormState } from 'features/omni-kit/state/automation/common'
import type { OmniAutomationPartialTakeProfitFormState } from 'features/omni-kit/state/automation/partial-take-profit'
import type { OmniAutomationStopLossFormState } from 'features/omni-kit/state/automation/stop-loss'
import type { OmniAutomationTrailingStopLossFormState } from 'features/omni-kit/state/automation/trailing-stop-loss'
import type { SupportedLambdaProtocols } from 'helpers/lambda/triggers'

export type OmniAutomationCommonActionPayload = {
  dpm: string
  networkId: NetworkIds
  protocol: SupportedLambdaProtocols
  strategy: {
    collateralAddress: string
    debtAddress: string
  }
}

export type OmniAutomationFormStates =
  | OmniAutomationFormState
  | OmniAutomationStopLossFormState
  | OmniAutomationTrailingStopLossFormState
  | OmniAutomationAutoBSFormState
  | OmniAutomationPartialTakeProfitFormState
