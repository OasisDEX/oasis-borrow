import getConfig from 'next/config'

const configUrl = getConfig()?.publicRuntimeConfig?.configUrl

/**
 * Actually fetches config from backend
 * @returns Config JSON
 */
export const configFetcherBackend = async function () {
  const response = await fetch(configUrl)
  const data = await response.json()
  return data
}
