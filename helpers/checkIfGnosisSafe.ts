import type { Context } from 'blockchain/network.types'

export function checkIfGnosisSafe({ walletLabel, web3 }: Pick<Context, 'walletLabel' | 'web3'>) {
  let isGnosisSafe = false

  // check if current provider is Gnosis connected by WalletConnect or by dedicated web3-react-connector
  if (walletLabel === 'WalletConnect') {
    // @ts-ignore
    if (web3.currentProvider.wc) {
      // @ts-ignore
      isGnosisSafe = web3.currentProvider.wc?._peerMeta?.name.includes('Gnosis')
    }
  }

  if (walletLabel === 'Safe') {
    isGnosisSafe = true
  }

  return isGnosisSafe
}
