import { type Chain, makeSDK, PositionUtils, type User } from '@summerfi/sdk-client'
import {
  Address,
  type AddressValue,
  Percentage,
  type Position,
  RiskRatio,
  RiskRatioType,
  Wallet,
} from '@summerfi/sdk-common/dist/common'
import { getChainInfoByChainId } from '@summerfi/sdk-common/dist/common/implementation/ChainFamilies'
import type { RefinanceParameters } from '@summerfi/sdk-common/dist/orders'
import type { SimulationType } from '@summerfi/sdk-common/dist/simulation/Enums'
import type { Simulation } from '@summerfi/sdk-common/dist/simulation/Simulation'
import { useEffect, useState } from 'react'

import { type RefinanceContext } from './RefinanceContext'

export function useSdkSimulation(context: RefinanceContext, address: AddressValue) {
  const [error, setError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [chain, setChain] = useState<null | Chain>(null)

  const [position, setPosition] = useState<null | Position>(null)
  const [simulation, setSimulation] = useState<null | Simulation<SimulationType.Refinance>>(null)

  const {
    positionId,
    slippage,
    chainInfo,
    liquidationPrice,
    collateralTokenAmount,
    debtTokenAmount,
    collateralPrice,
    debtPrice,
  } = context

  const sdk = makeSDK({ apiURL: '/api/sdk' })
  const wallet = Wallet.createFrom({
    address: Address.createFrom({ value: address }),
  })

  useEffect(() => {
    const fetchData = async () => {
      const fetchedChain = await sdk.chains.getChain({
        chainInfo: getChainInfoByChainId(chainInfo.chainId),
      })
      setChain(fetchedChain)

      const fetchedUser = await sdk.users.getUser({
        chainInfo: fetchedChain,
        walletAddress: wallet.address,
      })
      setUser(fetchedUser)
    }

    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [sdk, address, wallet, chainInfo.chainId])

  useEffect(() => {
    // TODO: grab from protocol.getPool
    const positionPool = {} as any
    const ltv = PositionUtils.getLTV({
      collateralTokenAmount,
      debtTokenAmount,
      collateralPriceInUsd: collateralPrice,
      debtPriceInUsd: debtPrice,
    })
    const _position: Position = {
      pool: positionPool,
      collateralAmount: collateralTokenAmount,
      debtAmount: debtTokenAmount,
      positionId,
      riskRatio: RiskRatio.createFrom({ ratio: ltv, type: RiskRatioType.LTV }),
    }

    setPosition(_position)

    // TODO: grab from protocol.getPool
    const targetPool = {} as any

    const refinanceParameters: RefinanceParameters = {
      position: _position,
      targetPool,
      slippage: Percentage.createFrom({ percentage: slippage }),
    }

    const fetchData = async () => {
      const _simulation =
        await sdk.simulator.refinance.simulateRefinancePosition(refinanceParameters)
      setSimulation(_simulation)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    collateralPrice,
    collateralTokenAmount,
    debtPrice,
    debtTokenAmount,
    liquidationPrice,
    positionId,
    sdk,
    slippage,
  ])

  return { error, user, chain, position, simulation, liquidationPrice }
}
