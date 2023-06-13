import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy, memoize } from 'lodash'

import { NetworkIds } from './network-ids'
import { isSupportedNetwork, NetworkLabelType, NetworkNames } from './network-names'
import { NetworkConfig, NetworkConfigHexId, networksByName } from './networks-config'
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

export const forkNetworks: NetworkConfig[] = Object.entries(forkSettings).map(
  ([networkName, forkNetwork]) => {
    const originalNetworkConfig = networksByName[networkName]
    return {
      ...originalNetworkConfig,
      id: forkNetwork.id as unknown as NetworkIds,
      originalId: originalNetworkConfig.id,
      hexId: `0x${Number(forkNetwork.id).toString(16)}` as NetworkConfigHexId,
      label: `${originalNetworkConfig.label} Test` as NetworkLabelType,
      rpcUrl: forkNetwork.url,
      getReadProvider: memoize(() => new JsonRpcBatchProvider(forkNetwork.url)),
      name: `${originalNetworkConfig.name}-test` as NetworkNames,
      isCustomFork: true,
      getParentNetwork: () => originalNetworkConfig,
    }
  },
)

export const forkNetworksByOriginalId = keyBy(forkNetworks, 'originalId')
export const forksByHexId = keyBy(forkNetworks, 'hexId')
