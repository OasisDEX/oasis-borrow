import { NetworkConfig } from 'blockchain/networks'

type WindowWithInjectedWallet = {
  ethereum: {
    isMetaMask: boolean
    isConnected: () => boolean
    request: (args: { method: string; params?: any[] }) => Promise<any>
  }
}
export async function addCustomForkToTheWallet(network: NetworkConfig) {
  if (!window) {
    return
  }
  const { ethereum } = window as unknown as WindowWithInjectedWallet
  if (!network.isCustomFork) {
    throw new Error('Only custom forks can be added to the wallet')
  }
  if (!ethereum) {
    throw new Error('No injected wallet found')
  }

  if (!ethereum.isMetaMask) {
    throw new Error('Only MetaMask is supported')
  }

  await ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [
      {
        chainId: network.hexId,
        rpcUrls: [network.rpcUrl],
        chainName: network.label,
        nativeCurrency: {
          name: network.token,
          symbol: network.token,
          decimals: 18,
        },
      },
    ],
  })
}
