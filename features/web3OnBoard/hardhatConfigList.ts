import { NetworkIds } from 'blockchain/networkIds'
import { NetworkConfigHexId, networksById, networksByName } from 'blockchain/networksConfig'
import { ethers } from 'ethers'
import {
  CustomHardhatParameterType,
  CustomHardhatStorageKey,
} from 'helpers/getCustomNetworkParameter'
import { isSupportedNetwork } from 'helpers/networkNames'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy } from 'lodash'

function isValidCustomHardhatParameters(
  element?: CustomHardhatParameterType,
): element is CustomHardhatParameterType {
  if (!element) {
    return false
  }
  return Object.keys(element).every((key) => isSupportedNetwork(key))
}

export const hardhatSettings = getStorageValue<CustomHardhatParameterType>(
  CustomHardhatStorageKey,
  {},
  isValidCustomHardhatParameters,
)

export const hardhatNetworkConfigs = Object.entries(hardhatSettings).map(
  ([networkName, hardhatConfig]) => {
    const originalNetworkConfig = networksByName[networkName]
    return {
      ...originalNetworkConfig,
      id: hardhatConfig.id as unknown as NetworkIds,
      originalId: originalNetworkConfig.id,
      hexId: `0x${Number(hardhatConfig.id).toString(16)}` as NetworkConfigHexId,
      label: `${originalNetworkConfig.label} Hardhat`,
      rpcUrl: hardhatConfig.url,
      readProvider: new ethers.providers.StaticJsonRpcProvider(hardhatConfig.url),
      name: `${originalNetworkConfig.name}-hardhat`,
    }
  },
)

export const hardhatNetworksById = { ...networksById, ...keyBy(hardhatNetworkConfigs, 'id') }
export const hardhatNetworksByOriginalId = keyBy(hardhatNetworkConfigs, 'originalId')
