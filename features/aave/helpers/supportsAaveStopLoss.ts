import { NetworkIds } from 'blockchain/networks'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { LendingProtocol } from 'lendingProtocols'

const supportedNetworks = [NetworkIds.MAINNET]

const supportedProtocols = [LendingProtocol.AaveV3]
const sparkProtocolStopLossEnabled = getFeatureToggle('SparkProtocolStopLoss')
if (sparkProtocolStopLossEnabled) {
  supportedProtocols.push(LendingProtocol.SparkV3)
}

export function supportsAaveStopLoss(protocol: LendingProtocol, network: NetworkIds) {
  return supportedProtocols.includes(protocol) && supportedNetworks.includes(network)
}
