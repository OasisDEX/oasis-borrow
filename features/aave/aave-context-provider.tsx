import { NetworkNames } from 'blockchain/networks'
import { useAccountContext, useMainContext, useProductContext } from 'components/context'
import { WithChildren } from 'helpers/types'
import { AaveLendingProtocol, LendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import React, { useContext, useEffect, useState } from 'react'

import { AaveContext } from './aave-context'
import { setupAaveV2Context } from './setup-aave-v2-context'
import { setupAaveV3Context } from './setup-aave-v3-context'
import { setupSparkV3Context } from './setup-spark-v3-context'

type AaveContexts = Partial<
  Record<NetworkNames, Partial<Record<AaveLendingProtocol | SparkLendingProtocol, AaveContext>>>
>

export const aaveContext = React.createContext<AaveContexts | undefined>(undefined)

export function isAaveContextAvailable(): boolean {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return !!useContext(aaveContext)
}

export function useAaveContext(
  protocol: AaveLendingProtocol | SparkLendingProtocol = LendingProtocol.AaveV2,
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
    throw new Error(
      `AaveContext for network ${network} and protocol ${protocol} is not available!}`,
    )
  }

  return aaveContextsForNetwork[protocol]!
}

export function AaveContextProvider({ children }: WithChildren) {
  const mainContext = useMainContext()
  const accountContext = useAccountContext()
  const productContext = useProductContext()
  const [aaveContexts, setAaveContexts] = useState<AaveContexts | undefined>(undefined)

  useEffect(() => {
    setAaveContexts({
      [NetworkNames.ethereumMainnet]: {
        [LendingProtocol.AaveV2]: setupAaveV2Context(mainContext, accountContext, productContext),
        [LendingProtocol.AaveV3]: setupAaveV3Context(
          mainContext,
          accountContext,
          productContext,
          NetworkNames.ethereumMainnet,
        ),
        [LendingProtocol.SparkV3]: setupSparkV3Context(
          mainContext,
          accountContext,
          productContext,
          NetworkNames.ethereumMainnet,
        ),
      },
      [NetworkNames.optimismMainnet]: {
        [LendingProtocol.AaveV3]: setupAaveV3Context(
          mainContext,
          accountContext,
          productContext,
          NetworkNames.optimismMainnet,
        ),
      },
      // [NetworkNames.arbitrumMainnet]: {
      //   [LendingProtocol.AaveV3]: setupAaveV3Context(productContext, NetworkNames.arbitrumMainnet),
      // },
    })
  }, [accountContext, mainContext, productContext])

  return <aaveContext.Provider value={aaveContexts}>{children}</aaveContext.Provider>
}
