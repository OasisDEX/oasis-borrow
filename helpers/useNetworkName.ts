import { useSetChain } from '@web3-onboard/react'
import { networksByHexId } from 'blockchain/networksConfig'
import { hardhatNetworkConfigs } from 'features/web3OnBoard/hardhatConfigList'
import { keyBy } from 'lodash'

import { mainnetNetworkParameter, useCustomNetworkParameter } from './getCustomNetworkParameter'

export function useNetworkName() {
  const [{ chains, connectedChain }] = useSetChain()
  const [customNetworkName] = useCustomNetworkParameter()
  const filteredChain = chains.filter(({ id }) => id === connectedChain?.id)
  if (!connectedChain) {
    return customNetworkName.network || mainnetNetworkParameter.network
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
  return { ...networksByHexId, ...keyBy(hardhatNetworkConfigs, 'hexId') }[filteredChain[0].id].name
}
