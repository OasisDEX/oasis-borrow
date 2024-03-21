import { emptyConfig } from 'components/context/PreloadAppDataContextProvider'
import { isServer } from 'helpers/isServer'

import { getRemoteConfigWithCache } from './access-config-backend'
import { loadConfigFromLocalStorage } from './access-config-context'
import { configCacheTime } from './constants'
import type { ConfigResponseType, ConfigResponseTypeKey } from './types'

export const configFetcher = async () => {
  const response = await fetch(`/api/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    console.error(`Error fetching config: ${response.statusText}`)
    return emptyConfig
  }

  return (await response.json()) as ConfigResponseType
}

export async function accessConfigDynamic<T extends ConfigResponseTypeKey>(
  configKey: T,
): Promise<ConfigResponseType[T]> {
  if (isServer()) {
    const result = await getRemoteConfigWithCache(configCacheTime.backend)
    return result[configKey]
  }
  const fromStorage = loadConfigFromLocalStorage()
  if (fromStorage !== emptyConfig) {
    return fromStorage[configKey]
  }

  const fetched = await configFetcher()
  return fetched[configKey]
}
