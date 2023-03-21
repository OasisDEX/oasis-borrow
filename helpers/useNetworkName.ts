import { useSetChain } from '@web3-onboard/react'
import { NetworkNameType } from 'blockchain/networksList'

import { mainnetNetworkParameter } from './getCustomNetworkParameter'

export function useNetworkName() {
  const [{ chains, connectedChain }] = useSetChain()
  const filteredChain = chains.filter(({ id }) => id === connectedChain?.id)
  if (!connectedChain) {
    return mainnetNetworkParameter.network as NetworkNameType
  }
  if (!filteredChain[0]) {
    console.error(`Chain not configured:
    ${JSON.stringify({ chains, connectedChain }, null, 4)}`)
    console.error('Returning Ethereum Mainnet.')
    return mainnetNetworkParameter.network as NetworkNameType
  }
  return filteredChain[0].label as NetworkNameType
}
