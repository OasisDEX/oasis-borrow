/**
 * Fetches the configuration data from the server and caches it for a specified amount of time.
 * @param cacheTime - The time in milliseconds to cache the configuration data. Defaults to 0, which means no caching.
 * @returns A promise that resolves to the configuration data.
 * @throws An error if there was an issue fetching the configuration data.
 */
import { configFetcherBackend } from 'handlers/config'
import type { ConfigResponseType } from 'helpers/config'

let cachedConfig: ConfigResponseType | undefined
let cacheExpirationTime: number | undefined

export async function getRemoteConfigWithCache(cacheTime = 0): Promise<ConfigResponseType> {
  if (cachedConfig && cacheExpirationTime && Date.now() < cacheExpirationTime) {
    return cachedConfig
  }
  const configResponse = await configFetcherBackend()
  if (!configResponse || configResponse.error) {
    throw new Error(`Error fetching config data: ${configResponse.error}`)
  }
  cachedConfig = configResponse
  cacheExpirationTime = Date.now() + cacheTime
  return configResponse
}
