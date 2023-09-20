import type { WalletState } from '@web3-onboard/core'
import type { NetworkConfigHexId } from 'blockchain/networks'

export function getConnectedNetwork(wallet: WalletState | null): NetworkConfigHexId | null {
  if (!wallet) return null

  const connectedChainId = wallet.chains[0].id
  return connectedChainId as NetworkConfigHexId
}
