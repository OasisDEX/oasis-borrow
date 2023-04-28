import { ConnectedChain } from '@web3-onboard/core'
import { NetworkConfigHexId, networks } from 'blockchain/networksConfig'

export const isTestnet = (connectedChain: ConnectedChain | null) => {
  if (!connectedChain) {
    return false
  }
  return networks
    .filter((network) => network.testnet)
    .map((network) => network.hexId)
    .includes(connectedChain.id as NetworkConfigHexId)
}
