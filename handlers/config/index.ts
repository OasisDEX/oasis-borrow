import { cacheObject } from 'helpers/api/cacheObject'
import { configCacheTime } from 'helpers/config'
import getConfig from 'next/config'

const configUrl = getConfig()?.publicRuntimeConfig?.configUrl

/**
 * Actually fetches config from backend
 * @returns Config JSON
 */
const configFetcherBackend = async function () {
  const response = await fetch(configUrl)
  const data = await response.json()
  return data
}

/**
 * Fetches config from backend, caches it for configCacheTime and returns it
 * @returns Record<string, string>
 */
export const configHandler = cacheObject<Record<string, string>>(
  configFetcherBackend,
  configCacheTime.backend,
  'config-cache',
)
