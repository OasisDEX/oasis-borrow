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
    console.error(`Chain not configured:
    ${JSON.stringify({ chains, connectedChain }, null, 4)}`)
    console.error('Returning Ethereum Mainnet.')
    return mainnetNetworkParameter.network
  }
  return { ...networksByHexId, ...keyBy(hardhatNetworkConfigs, 'hexId') }[filteredChain[0].id].name
}
