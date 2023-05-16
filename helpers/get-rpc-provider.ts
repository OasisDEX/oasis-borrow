import { NetworkIds } from 'blockchain/networkIds'
import { networksById } from 'blockchain/networksConfig'
import { ethers } from 'ethers'
import { hardhatNetworksByOriginalId } from 'features/web3OnBoard/hardhatConfigList'

export function getRpcProvider(networkId: NetworkIds): ethers.providers.Provider {
  const hardhatProvider = hardhatNetworksByOriginalId[networkId]?.readProvider
  if (hardhatProvider) {
    return hardhatProvider
  }
  const mainProvider = networksById[networkId].readProvider
  if (mainProvider) {
    return mainProvider
  }

  console.warn('No provider found for network', networkId)
  return ethers.providers.getDefaultProvider({
    chainId: Number(networkId),
    name: 'EVM Network',
  })
}
