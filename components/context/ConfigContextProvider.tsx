import { ConfigContext, setupConfigContext } from 'helpers/config'
import { WithChildren } from 'helpers/types'
import React, { useEffect, useState } from 'react'

export const configContext = React.createContext<ConfigContext | undefined>(undefined)

export function ConfigContextProvider({ children }: WithChildren) {
  const [context, setContext] = useState<ConfigContext | undefined>(undefined)

  useEffect(() => {
    const setup = async () => {
      const config = await setupConfigContext()
      setContext(config)
    }
    void setup()
  }, [])
  return <configContext.Provider value={context}>{children}</configContext.Provider>
}
