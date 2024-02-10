import { NetworkIds } from 'blockchain/networks'
import { getLocalAppConfig } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'

const supportedNetworks = [NetworkIds.MAINNET]

const supportedProtocols = [LendingProtocol.AaveV3]
const {
  SparkProtocolStopLoss,
  AaveV3ProtectionLambdaBase,
  AaveV3ProtectionLambdaArbitrum,
  AaveV3ProtectionLambdaOptimism,
} = getLocalAppConfig('features')
if (SparkProtocolStopLoss) {
  supportedProtocols.push(LendingProtocol.SparkV3)
}
if (AaveV3ProtectionLambdaBase) {
  supportedNetworks.push(NetworkIds.BASEMAINNET)
}
if (AaveV3ProtectionLambdaArbitrum) {
  supportedNetworks.push(NetworkIds.ARBITRUMMAINNET)
}
if (AaveV3ProtectionLambdaOptimism) {
  supportedNetworks.push(NetworkIds.OPTIMISMMAINNET)
}

export function supportsAaveStopLoss(protocol: LendingProtocol, network: NetworkIds) {
  return supportedProtocols.includes(protocol) && supportedNetworks.includes(network)
}
