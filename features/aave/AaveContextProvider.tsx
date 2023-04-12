import { useAppContext } from 'components/AppContextProvider'
import { WithChildren } from 'helpers/types'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'
import React, { useContext, useEffect, useState } from 'react'

import { AaveContext, setupAaveV2Context } from './AaveContext'
import { setupAaveV3Context } from './SetupAaveV3Context'

type AaveContexts = {
  [LendingProtocol.AaveV2]: AaveContext
  [LendingProtocol.AaveV3]: AaveContext
}

export const aaveContext = React.createContext<AaveContexts | undefined>(undefined)

export function isAaveContextAvailable(): boolean {
  return !!useContext(aaveContext)
}

export function useAaveContext(
  protocol: AaveLendingProtocol = LendingProtocol.AaveV2,
): AaveContext {
  const ac = useContext(aaveContext)
  if (!ac || !ac[protocol]) {
    throw new Error("AaveContext not available! useAppContext can't be used serverside")
  }
  return ac[protocol]!
}

export function AaveContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [aaveContexts, setAaveContexts] = useState<AaveContexts | undefined>(undefined)

  useEffect(() => {
    if (appContext) {
      const aaveV2Context = setupAaveV2Context(appContext)

      // for now it's the same as AaveV2
      const aaveV3Context = setupAaveV3Context(appContext)

      setAaveContexts({
        [LendingProtocol.AaveV2]: aaveV2Context,
        [LendingProtocol.AaveV3]: aaveV3Context,
      })
    }
  }, [appContext])

  return <aaveContext.Provider value={aaveContexts}>{children}</aaveContext.Provider>
}
