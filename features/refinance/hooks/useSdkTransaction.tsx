import { useRefinanceContext } from 'features/refinance/contexts'
import { useEffect, useMemo, useState } from 'react'
import { makeSDK } from 'summerfi-sdk-client'
import type { ISimulation, Order, SimulationType } from 'summerfi-sdk-common'
import { Address, AddressType, Wallet } from 'summerfi-sdk-common'

export function useSdkRefinanceTransaction({
  refinanceSimulation,
  importPositionSimulation,
}: {
  refinanceSimulation: ISimulation<SimulationType.Refinance> | null
  importPositionSimulation: ISimulation<SimulationType.ImportPosition> | null
}) {
  const [error, setError] = useState<null | string>(null)
  const [txImportPosition, setTxImportPosition] = useState<null | Order>(null)
  const [txRefinance, setTxRefinance] = useState<null | Order>(null)

  const {
    environment: {
      slippage,
      chainInfo,
      marketPrices: { collateralPrice, debtPrice },
      address,
    },
    position: { positionId, collateralTokenData, debtTokenData, positionType },
    poolData: { poolId },
    form: {
      state: { strategy, dpm },
    },
  } = useRefinanceContext()
  const sdk = useMemo(() => makeSDK({ apiURL: '/api/sdk' }), [])

  useEffect(() => {
    if (
      !strategy ||
      !dpm?.address ||
      refinanceSimulation == null ||
      importPositionSimulation == null
    ) {
      return
    }
    const fetchData = async () => {
      if (address === undefined) {
        throw new Error('Wallet is not connected')
      }
      const wallet = Wallet.createFrom({
        address: Address.createFrom({ value: address, type: AddressType.Ethereum }),
      })
      const user = await sdk.users.getUser({
        chainInfo,
        walletAddress: wallet.address,
      })

      const [_importPositionOrder, _refinanceOrder] = await Promise.all([
        user.newOrder({
          positionsManager: {
            address: Address.createFromEthereum({
              value: dpm.address as `0x${string}`,
            }),
          },
          simulation: importPositionSimulation,
        }),
        user.newOrder({
          positionsManager: {
            address: Address.createFromEthereum({
              value: dpm.address as `0x${string}`,
            }),
          },
          simulation: refinanceSimulation,
        }),
      ])
      setTxImportPosition(_importPositionOrder)
      setTxRefinance(_refinanceOrder)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    sdk,
    dpm?.address,
    slippage,
    collateralPrice,
    debtPrice,
    address,
    chainInfo,
    poolId,
    positionId,
    JSON.stringify(collateralTokenData),
    JSON.stringify(debtTokenData),
    positionType,
    strategy?.product,
    strategy?.primaryToken,
    strategy?.secondaryToken,
    JSON.stringify(importPositionSimulation),
    JSON.stringify(refinanceSimulation),
  ])

  return { error, txImportPosition, txRefinance }
}
