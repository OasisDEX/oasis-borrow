import { useSetChain } from '@web3-onboard/react'
import {
  isSupportedNetwork,
  mainnetNetworkParameter,
  networksListWithForksByHexId,
  useCustomNetworkParameter,
} from 'blockchain/networks'
import {} from 'blockchain/networks'

export function useNetworkName() {
  const [{ chains, connectedChain }] = useSetChain()
  const [customNetworkName] = useCustomNetworkParameter()
  const filteredChain = chains.filter(({ id }) => id === connectedChain?.id)
  if (!connectedChain) {
    if (isSupportedNetwork(customNetworkName.network)) {
      return customNetworkName.network
    }
    return mainnetNetworkParameter.network
  }
  if (!filteredChain[0]) {
    console.warn(
      `Returning Ethereum Mainnet because the chain is not configured: ${JSON.stringify(
        { chains, connectedChain },
        null,
        4,
      )}`,
    )
    return mainnetNetworkParameter.network
  }
  return networksListWithForksByHexId[filteredChain[0].id].name
}
