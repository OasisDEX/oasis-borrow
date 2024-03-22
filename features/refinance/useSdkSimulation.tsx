import { PositionUtils, type SDKManager } from '@summerfi/sdk-client'
import {
  Percentage,
  type Position,
  RiskRatio,
  RiskRatioType,
} from '@summerfi/sdk-common/dist/common'
import type { RefinanceParameters } from '@summerfi/sdk-common/dist/orders'
import type { SimulationType } from '@summerfi/sdk-common/dist/simulation/Enums'
import type { Simulation } from '@summerfi/sdk-common/dist/simulation/Simulation'
import React, { useEffect, useState } from 'react'

import { refinanceContext } from './RefinanceContext'

export function useSdkSimulation(sdk: SDKManager) {
  const context = React.useContext(refinanceContext)
  if (context === undefined) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  const {
    positionId,
    slippage,
    chainInfo,
    collateralPrice,
    debtPrice,
    liquidationThreshold,
    collateralTokenAmount,
    debtTokenAmount,
    tokenPrices,
    address,
  } = context

  const [error, setError] = useState<null | string>(null)
  const [targetPosition, setTargetPosition] = useState<null | Position>(null)
  const [simulation, setSimulation] = useState<null | Simulation<SimulationType.Refinance>>(null)

  useEffect(() => {
    // TODO: grab from protocol.getPool
    const positionPool = {} as any
    const ltv = PositionUtils.getLTV({
      collateralTokenAmount,
      debtTokenAmount,
      collateralPrice,
      debtPrice,
    })
    const position: Position = {
      pool: positionPool,
      collateralAmount: collateralTokenAmount,
      debtAmount: debtTokenAmount,
      positionId,
      riskRatio: RiskRatio.createFrom({ ratio: ltv, type: RiskRatioType.LTV }),
    }

    setTargetPosition(position)

    const liquidationPrice = PositionUtils.getLiquidationPrice({
      position,
      collateralPrice,
      debtPrice,
      liquidationThreshold,
    })

    // TODO: grab from protocol.getPool
    const targetPool = {} as any

    const refinanceParameters: RefinanceParameters = {
      position: position,
      targetPool,
      slippage: Percentage.createFrom({ percentage: slippage }),
    }

    const fetchData = async () => {
      const simulation = await sdk.simulator.refinance.simulateRefinancePosition(
        refinanceParameters,
      )
      setSimulation(simulation)
    }
    void fetchData().catch((err) => {
      setError(err.message)
    })
  }, [
    collateralPrice,
    collateralTokenAmount,
    debtPrice,
    debtTokenAmount,
    liquidationThreshold,
    positionId,
    sdk,
    slippage,
  ])

  return { error, position: targetPosition, simulation }
}
