import {
  configCacheTime,
  ConfigResponseType,
  Feature,
  saveConfigToLocalStorage,
} from 'helpers/config'

const configFetcher = () =>
  fetch(`/api/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const emptyConfig = {
  features: Object.fromEntries(Object.values(Feature).map((feature) => [feature, false])),
} as ConfigResponseType

let config = { ...emptyConfig }

export async function setupConfigContext() {
  console.info('Config context setup')
  const fetchConfig = async () => {
    try {
      const response = await configFetcher()
      config = await response.json()
      saveConfigToLocalStorage(config)
    } catch (error) {
      console.error(error)
    }
  }
  await fetchConfig()
  setInterval(fetchConfig, 100 * configCacheTime)

  return {
    config,
  }
}
