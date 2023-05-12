import { useAppContext } from 'components/AppContextProvider'
import { NetworkNames } from 'helpers/networkNames'
import { WithChildren } from 'helpers/types'
import { AaveLendingProtocol, LendingProtocol } from 'lendingProtocols'
import React, { useContext, useEffect, useState } from 'react'

import { AaveContext } from './aave-context'
import { setupAaveV2Context } from './setup-aave-v2-context'
import { setupAaveV3Context } from './setup-aave-v3-context'

type AaveContexts = Partial<Record<NetworkNames, Partial<Record<AaveLendingProtocol, AaveContext>>>>

export const aaveContext = React.createContext<AaveContexts | undefined>(undefined)

export function isAaveContextAvailable(): boolean {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return !!useContext(aaveContext)
}

export function useAaveContext(
  protocol: AaveLendingProtocol = LendingProtocol.AaveV2,
  network: NetworkNames = NetworkNames.ethereumMainnet,
): AaveContext {
  const ac = useContext(aaveContext)
  if (!ac) {
    throw new Error('AaveContext not available!')
  }
  if (!ac[network]) {
    throw new Error(`AaveContext for network ${network} is not available!`)
  }
  const aaveContextsForNetwork = ac[network]!
  if (!aaveContextsForNetwork[protocol]) {
    throw new Error(`AaveContext for network ${network} and protocol ${protocol} is not available!`)
  }

  return aaveContextsForNetwork[protocol]!
}

export function AaveContextProvider({ children }: WithChildren) {
  const appContext = useAppContext()
  const [aaveContexts, setAaveContexts] = useState<AaveContexts | undefined>(undefined)

  useEffect(() => {
    if (appContext) {
      setAaveContexts({
        [NetworkNames.ethereumMainnet]: {
          [LendingProtocol.AaveV2]: setupAaveV2Context(appContext),
          [LendingProtocol.AaveV3]: setupAaveV3Context(appContext, NetworkNames.ethereumMainnet),
        },
        [NetworkNames.optimismMainnet]: {
          [LendingProtocol.AaveV3]: setupAaveV3Context(appContext, NetworkNames.optimismMainnet),
        },
      })
    }
  }, [appContext])

  return <aaveContext.Provider value={aaveContexts}>{children}</aaveContext.Provider>
}
