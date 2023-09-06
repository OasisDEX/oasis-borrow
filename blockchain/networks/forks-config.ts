import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { NetworkIds } from 'blockchain/networks/network-ids'
import { NetworkLabelType, NetworkNames } from 'blockchain/networks/network-names'
import { NetworkConfig, NetworkConfigHexId, networksByName } from 'blockchain/networks/networks-config'
import {
  CustomForkParameterType,
  CustomForkStorageKey,
  isValidCustomForkParameter,
} from 'blockchain/networks/use-custom-fork-parameter'
import { getFeatureToggle } from 'helpers/useFeatureToggle'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy, memoize } from 'lodash'

export const forkSettings = getFeatureToggle('UseNetworkSwitcherForks')
  ? getStorageValue<CustomForkParameterType>(CustomForkStorageKey, {}, isValidCustomForkParameter)
  : {}

export const forkNetworks: NetworkConfig[] = Object.entries(forkSettings).map(
  ([networkName, forkNetwork]) => {
    const originalNetworkConfig = networksByName[networkName]

    return {
      ...originalNetworkConfig,
      id: forkNetwork.id as unknown as NetworkIds,
      originalId: originalNetworkConfig.id,
      originalHexId: originalNetworkConfig.hexId,
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

export const forksByParentHexId = keyBy(forkNetworks, 'originalHexId')
