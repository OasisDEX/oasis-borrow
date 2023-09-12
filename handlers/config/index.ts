import { cacheObject } from 'helpers/api/cacheObject'
import { configCacheTime } from 'helpers/config'
import getConfig from 'next/config'

const configUrl = getConfig()?.publicRuntimeConfig?.configUrl

const configFetcherBackend = async function () {
  const response = await fetch(configUrl)
  const data = await response.json()
  return data
}

export const configHandler = cacheObject<Record<string, string>>(
  configFetcherBackend,
  configCacheTime,
  'config-cache',
)
