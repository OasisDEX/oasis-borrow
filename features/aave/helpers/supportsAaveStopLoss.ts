import { NetworkIds } from 'blockchain/networks'
import { getAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'

const supportedNetworks = [NetworkIds.MAINNET]

const supportedProtocols = [LendingProtocol.AaveV3]
const { SparkProtocolStopLoss: sparkProtocolStopLossEnabled } = getAppConfig('features')
if (sparkProtocolStopLossEnabled) {
  supportedProtocols.push(LendingProtocol.SparkV3)
}

export function supportsAaveStopLoss(protocol: LendingProtocol, network: NetworkIds) {
  return supportedProtocols.includes(protocol) && supportedNetworks.includes(network)
}
