import { NetworkIds } from 'blockchain/networks'
import { LendingProtocol } from 'lendingProtocols'

const supportedProtocols = [LendingProtocol.AaveV3]
const supportedNetworks = [NetworkIds.MAINNET]

export function supportsAaveStopLoss(protocol: LendingProtocol, network: NetworkIds) {
  return supportedProtocols.includes(protocol) && supportedNetworks.includes(network)
}
