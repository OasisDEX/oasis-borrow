import {
  configCacheTime,
  ConfigContext,
  ConfigResponseType,
  Feature,
  saveConfigToLocalStorage,
} from 'helpers/config'
import { WithChildren } from 'helpers/types'
import React, { useEffect, useState } from 'react'

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

export const configContext = React.createContext<ConfigContext | undefined>(undefined)

export function ConfigContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<ConfigContext | undefined>(undefined)

  useEffect(() => {
    const setup = async () => {
      const fetchConfig = async () => {
        try {
          const response = await configFetcher()
          const config = (await response.json()) as ConfigResponseType
          setContext({ config })
          saveConfigToLocalStorage(config)
        } catch (error) {
          console.error(error)
        }
      }
      await fetchConfig()
      setInterval(fetchConfig, 1000 * configCacheTime)
    }
    void setup()
  }, [])
  return <configContext.Provider value={context}>{children}</configContext.Provider>
}
