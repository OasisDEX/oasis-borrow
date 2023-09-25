import { useProductHubData } from 'features/productHub/hooks/useProductHubData'
import type { ConfigResponseType, PreloadAppDataContext } from 'helpers/config'
import { configCacheTime, saveConfigToLocalStorage } from 'helpers/config'
import type { WithChildren } from 'helpers/types/With.types'
import { LendingProtocol } from 'lendingProtocols'
import React, { useContext, useEffect, useState } from 'react'
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
  ) as Record<FeaturesEnum, boolean>,
  parameters: {},
} as ConfigResponseType

export const preloadAppDataContext = React.createContext<PreloadAppDataContext | undefined>(
  undefined,
)

export function usePreloadAppDataContext(): PreloadAppDataContext {
  const ac = useContext(preloadAppDataContext)
  if (!ac) {
    throw new Error(
      "PreloadAppDataContext  not available! usePreloadAppDataContext can't be used serverside",
    )
  }
  return ac
}

export function PreloadAppDataContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<PreloadAppDataContext | undefined>(undefined)

  const [config, setConfig] = useState<ConfigResponseType | undefined>(undefined)
  const { data: productHub } = useProductHubData({
    protocols: [
      LendingProtocol.Ajna,
      LendingProtocol.AaveV2,
      LendingProtocol.AaveV3,
      LendingProtocol.Maker,
      LendingProtocol.SparkV3,
    ].filter((p) => p) as LendingProtocol[],
  })

  useEffect(() => {
    const setup = async () => {
      const fetchConfig = async () => {
        try {
          const response = await configFetcher()
          const configResponse = (await response.json()) as ConfigResponseType
          if (!configResponse || configResponse.error) {
            throw new Error(`Error fetching preload app data: ${configResponse.error}`)
          }
          setConfig(configResponse)
          saveConfigToLocalStorage(configResponse)
        } catch (error) {
          console.error(`Error fetching preload app data context: ${error}`)
        }
      }
      await fetchConfig()
      setInterval(fetchConfig, 1000 * configCacheTime.frontend)
    }
    setup().catch((error) => {
      console.error(`Error setting up preload app data context: ${error}`)
    })
  }, [])

  useEffect(() => {
    if (config && productHub) {
      setContext({ config, productHub })
    }
  }, [config, productHub])

  return <preloadAppDataContext.Provider value={context}>{children}</preloadAppDataContext.Provider>
}
