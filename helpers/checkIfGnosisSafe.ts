import { Context } from 'blockchain/network'

export function checkIfGnosisSafe({
  connectionKind,
  walletLabel,
  connectionMethod,
  web3,
}: Pick<Context, 'connectionKind' | 'walletLabel' | 'connectionMethod' | 'web3'>) {
  let isGnosisSafe = false

  // check if current provider is Gnosis connected by WalletConnect or by dedicated web3-react-connector
  if (
    connectionKind === 'walletConnect' ||
    (connectionMethod === 'web3-onboard' && walletLabel === 'WalletConnect')
  ) {
    // @ts-ignore
    if (web3.currentProvider.wc) {
      // @ts-ignore
      isGnosisSafe = web3.currentProvider.wc?._peerMeta?.name.includes('Gnosis')
    }
  }

  if (connectionKind === 'gnosisSafe') {
    isGnosisSafe = true
  }

  if (connectionMethod === 'web3-onboard' && walletLabel === 'Safe') {
    isGnosisSafe = true
  }

  return isGnosisSafe
}
