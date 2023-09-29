import type { ConfigResponseType } from 'helpers/config'
import getConfig from 'next/config'

const configUrl = getConfig()?.publicRuntimeConfig?.configUrl

/**
 * Actually fetches config from backend
 * @returns Config JSON
 */
export const configFetcherBackend = async function (): Promise<ConfigResponseType> {
  const response = await fetch(configUrl)
  const data = await response.json()
  return data
}
