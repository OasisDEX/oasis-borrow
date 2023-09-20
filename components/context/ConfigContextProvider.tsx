import {
  configCacheTime,
  ConfigContext,
  ConfigResponseType,
  saveConfigToLocalStorage,
} from 'helpers/config'
import { WithChildren } from 'helpers/types'
import React, { useEffect, useState } from 'react'
import { FeaturesEnum } from 'types/config'

const configFetcher = () =>
  fetch(`/api/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

export const emptyConfig = {
  features: Object.fromEntries(
    Object.values(FeaturesEnum).map((feature: FeaturesEnum) => [feature, false]),
  ),
} as ConfigResponseType

export const configContext = React.createContext<ConfigContext | undefined>(undefined)

export function ConfigContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<ConfigContext | undefined>(undefined)
  useEffect(() => {
    const setup = async () => {
      const fetchConfig = async () => {
        try {
          const response = await configFetcher()
          const config = (await response.json()) as ConfigResponseType
          if (!config || config.error) {
            throw new Error(`Error fetching config: ${config.error}`)
          }
          setContext({ config })
          saveConfigToLocalStorage(config)
        } catch (error) {
          console.error(`Error fetching config: ${error}`)
        }
      }
      await fetchConfig()
      setInterval(fetchConfig, 1000 * configCacheTime.frontend)
    }
    setup().catch((error) => {
      console.error(`Error setting up config context: ${error}`)
    })
  }, [])
  return <configContext.Provider value={context}>{children}</configContext.Provider>
}
