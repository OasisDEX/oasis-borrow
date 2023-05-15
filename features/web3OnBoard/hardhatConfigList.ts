import { NetworkIds } from 'blockchain/networkIds'
import { NetworkConfigHexId, networksById, networksByName } from 'blockchain/networksConfig'
import {
  CustomHardhatParameterType,
  CustomHardhatStorageKey,
} from 'helpers/getCustomNetworkParameter'
import { NetworkNames } from 'helpers/networkNames'
import { getStorageValue } from 'helpers/useLocalStorage'
import { keyBy } from 'lodash'

export const hardhatSettings = getStorageValue<CustomHardhatParameterType>(
  CustomHardhatStorageKey,
  {},
)
export const hardhatSettingsKeys = Object.keys(hardhatSettings) as NetworkNames[]

export const hardhatNetworkConfigs = hardhatSettingsKeys.map((hardhatNetworkName: NetworkNames) => {
  const hardhatConfig = hardhatSettings[hardhatNetworkName]
  const originalNetworkConfig = networksByName[hardhatNetworkName]
  return {
    id: hardhatConfig.id as unknown as NetworkIds,
    hexId: `0x${Number(hardhatConfig.id).toString(16)}` as NetworkConfigHexId,
    label: `${originalNetworkConfig.label} Hardhat`,
    rpcUrl: hardhatConfig.url,
    name: `${originalNetworkConfig.name}-hardhat`,
    token: originalNetworkConfig.token,
    color: originalNetworkConfig.color,
    icon: originalNetworkConfig.icon,
    testnetHexId: originalNetworkConfig.testnetHexId,
    mainnetHexId: originalNetworkConfig.mainnetHexId,
  }
})

export const hardhatNetworksById = { ...networksById, ...keyBy(hardhatNetworkConfigs, 'id') }
