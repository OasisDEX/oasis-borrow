import { JsonRpcBatchProvider } from 'blockchain/jsonRpcBatchProvider'
import { getLocalAppConfig } from 'helpers/config'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy, memoize } from 'lodash'
import { FeaturesEnum } from 'types/config'

import type { NetworkIds } from './network-ids'
import type { NetworkLabelType, NetworkNames } from './network-names'
import type { NetworkConfig, NetworkConfigHexId } from './networks-config'
import { networksByName } from './networks-config'
import type { CustomForkParameterType } from './use-custom-fork-parameter'
import { CustomForkStorageKey, isValidCustomForkParameter } from './use-custom-fork-parameter'

export const forkSettings = getLocalAppConfig('features')[FeaturesEnum.UseNetworkSwitcherForks]
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
