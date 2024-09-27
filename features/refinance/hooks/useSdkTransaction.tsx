import { makeSDK } from '@summer_fi/summerfi-sdk-client'
import type { ISimulation, Order, SimulationType } from '@summer_fi/summerfi-sdk-common'
import { Address, AddressType, PositionsManager, Wallet } from '@summer_fi/summerfi-sdk-common'
import { useRefinanceContext } from 'features/refinance/contexts'
import { RefinanceSidebarStep } from 'features/refinance/types'
import { LendingProtocol } from 'lendingProtocols'
import { useEffect, useMemo, useState } from 'react'

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
    environment: { chainInfo, address },
    position: { lendingProtocol },
    form: {
      state: { dpm },
    },
    steps: { currentStep },
  } = useRefinanceContext()
  const sdk = useMemo(() => makeSDK({ apiURL: '/api/sdk' }), [])

  // Reset state when user go back to strategy or option step
  useEffect(() => {
    if ([RefinanceSidebarStep.Option, RefinanceSidebarStep.Strategy].includes(currentStep)) {
      setError(null)
      setTxImportPosition(null)
      setTxRefinance(null)
    }
  }, [currentStep])

  useEffect(() => {
    if (
      !dpm?.address ||
      refinanceSimulation == null ||
      (lendingProtocol === LendingProtocol.Maker && importPositionSimulation == null)
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

      const _refinanceOrder = await user.newOrder({
        positionsManager: PositionsManager.createFrom({
          address: Address.createFromEthereum({
            value: dpm.address as `0x${string}`,
          }),
        }),
        simulation: refinanceSimulation,
      })
      setTxRefinance(_refinanceOrder)

      // for maker
      if (lendingProtocol === LendingProtocol.Maker && importPositionSimulation != null) {
        const _importPositionOrder = await user.newOrder({
          positionsManager: PositionsManager.createFrom({
            address: Address.createFromEthereum({
              value: dpm.address as `0x${string}`,
            }),
          }),
          simulation: importPositionSimulation,
        })
        setTxImportPosition(_importPositionOrder)
      }
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    sdk,
    dpm?.address,
    address,
    chainInfo,
    lendingProtocol,
    JSON.stringify(importPositionSimulation),
    JSON.stringify(refinanceSimulation),
  ])

  return { error, txImportPosition, txRefinance }
}
