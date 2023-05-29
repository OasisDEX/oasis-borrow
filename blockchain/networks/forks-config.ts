import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { ethers } from 'ethers'
import { GraphQLClient } from 'graphql-request'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy } from 'lodash'

import { NetworkIds } from './network-ids'
import { isSupportedNetwork } from './network-names'
import { NetworkConfigHexId, networksByName } from './networks-config'
import { CustomForkParameterType, CustomForkStorageKey } from './use-custom-fork-parameter'

function isValidCustomForkParameters(
  element?: CustomForkParameterType,
): element is CustomForkParameterType {
  if (!element) {
    return false
  }
  return Object.keys(element).every((key) => isSupportedNetwork(key))
}

export const forkSettings = getStorageValue<CustomForkParameterType>(
  CustomForkStorageKey,
  {},
  isValidCustomForkParameters,
)

export interface ForkNetworkConfig {
  badge: string
  cacheApi?: GraphQLClient
  color: `#${number | string}`
  enabled: boolean
  hexId: NetworkConfigHexId
  icon: string
  id: number
  label: string
  mainnetHexId?: NetworkConfigHexId
  mainnetId?: NetworkIds
  name: string
  originalId: NetworkIds
  readProvider: ethers.providers.Provider
  rpcUrl: string
  testnet: boolean
  testnetHexId?: NetworkConfigHexId
  testnetId?: NetworkIds
  token: string
}

export const forkNetworks: ForkNetworkConfig[] = Object.entries(forkSettings).map(
  ([networkName, forkNetwork]) => {
    const originalNetworkConfig = networksByName[networkName]
    return {
      ...originalNetworkConfig,
      id: forkNetwork.id as unknown as NetworkIds,
      originalId: originalNetworkConfig.id,
      hexId: `0x${Number(forkNetwork.id).toString(16)}` as NetworkConfigHexId,
      label: `${originalNetworkConfig.label} Test`,
      rpcUrl: forkNetwork.url,
      readProvider: new JsonRpcBatchProvider(forkNetwork.url),
      name: `${originalNetworkConfig.name}-test`,
      isCustomFork: true,
      parentNetwork: originalNetworkConfig,
    }
  },
)

export const forkNetworksByOriginalId = keyBy(forkNetworks, 'originalId')
export const forksByHexId = keyBy(forkNetworks, 'hexId')
