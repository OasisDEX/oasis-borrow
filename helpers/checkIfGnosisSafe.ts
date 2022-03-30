import { ConnectionKind } from '@oasisdex/web3-context'
import Web3 from 'web3'

export function checkIfGnosisSafe(connectionKind: ConnectionKind, web3: Web3) {
  let isGnosisSafe = false

  // check if current provider is Gnosis connected by WalletConnect or by dedicated web3-react-connector
  if (connectionKind === 'walletConnect') {
    // @ts-ignore
    if (web3.currentProvider.wc) {
      // @ts-ignore
      isGnosisSafe = web3.currentProvider.wc?._peerMeta?.name.includes('Gnosis')
    }
  }

  if (connectionKind === 'gnosisSafe') {
    isGnosisSafe = true
  }

  return isGnosisSafe
}
