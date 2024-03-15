import type { NetworkIds } from 'blockchain/networks'
import type { SupportedLambdaProtocols } from 'helpers/triggers'

export type OmniAutomationCommonActionPayload = {
  dpm: string
  networkId: NetworkIds
  protocol: SupportedLambdaProtocols
  strategy: {
    collateralAddress: string
    debtAddress: string
  }
}
