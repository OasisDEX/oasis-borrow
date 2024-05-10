import type { PreloadAppDataContext } from 'helpers/config'
import { configCacheTime, getLocalAppConfig, saveConfigToLocalStorage } from 'helpers/config'
import { LendingProtocol } from 'lendingProtocols'
import type { PropsWithChildren } from 'react'
import React, { useContext, useEffect, useState } from 'react'

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

export function PreloadAppDataContextProvider({ children }: PropsWithChildren<{}>) {
  const [context, setContext] = useState<PreloadAppDataContext>()
  const { AjnaSafetySwitch, MorphoSafetySwitch } = getLocalAppConfig('features')

  useEffect(() => {
    const setup = async () => {
      const fetchConfig = async () => {
        try {
          const response = await fetch(
            `/api/prerequisites?protocols=${[
              ...(AjnaSafetySwitch ? [] : [LendingProtocol.Ajna]),
              LendingProtocol.AaveV2,
              LendingProtocol.AaveV3,
              LendingProtocol.Maker,
              ...(MorphoSafetySwitch ? [] : [LendingProtocol.MorphoBlue]),
              LendingProtocol.SparkV3,
            ]}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          const data = (await response.json()) as PreloadAppDataContext

          if (!data) throw new Error('Error fetching preload app data')

          setContext(data)
          saveConfigToLocalStorage(data.config)
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

  return <preloadAppDataContext.Provider value={context}>{children}</preloadAppDataContext.Provider>
}
