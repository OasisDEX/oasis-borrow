import { NetworkNames } from 'blockchain/networks'
import { useAccountContext } from 'components/context/AccountContextProvider'
import { useMainContext } from 'components/context/MainContextProvider'
import { useProductContext } from 'components/context/ProductContextProvider'
import type { AaveLendingProtocol, SparkLendingProtocol } from 'lendingProtocols'
import { LendingProtocol } from 'lendingProtocols'
import type { PropsWithChildren } from 'react'
import React, { useContext, useEffect, useState } from 'react'

import type { AaveContext } from './aave-context'
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
  // Ensure that we are able to use aave on forks where networks names have -test suffix
  const resolvedNetwork = network.split('-')[0] as NetworkNames
  const ac = useContext(aaveContext)
  if (!ac) {
    throw new Error('AaveContext not available!')
  }
  if (!ac[resolvedNetwork]) {
    throw new Error(`AaveContext for network ${resolvedNetwork} is not available!`)
  }
  const aaveContextsForNetwork = ac[resolvedNetwork]!
  if (!aaveContextsForNetwork[protocol]) {
    throw new Error(
      `AaveContext for network ${resolvedNetwork} and protocol ${protocol} is not available!}`,
    )
  }

  return aaveContextsForNetwork[protocol]!
}

export function AaveContextProvider({ children }: PropsWithChildren<{}>) {
  const mainContext = useMainContext()
  const accountContext = useAccountContext()
  const productContext = useProductContext()
  const [aaveContexts, setAaveContexts] = useState<AaveContexts | undefined>(undefined)

  useEffect(() => {
    if (productContext) {
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
        [NetworkNames.arbitrumMainnet]: {
          [LendingProtocol.AaveV3]: setupAaveV3Context(
            mainContext,
            accountContext,
            productContext,
            NetworkNames.arbitrumMainnet,
          ),
        },
        [NetworkNames.baseMainnet]: {
          [LendingProtocol.AaveV3]: setupAaveV3Context(
            mainContext,
            accountContext,
            productContext,
            NetworkNames.baseMainnet,
          ),
        },
      })
    }
  }, [accountContext, mainContext, productContext])

  return <aaveContext.Provider value={aaveContexts}>{children}</aaveContext.Provider>
}
