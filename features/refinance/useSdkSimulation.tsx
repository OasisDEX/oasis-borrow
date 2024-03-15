import type { SDKManager } from '@summerfi/sdk-client'
import { Percentage, type Position } from '@summerfi/sdk-common/dist/common'
import type { RefinanceParameters } from '@summerfi/sdk-common/dist/orders'
import React, { useEffect, useState } from 'react'

import { refinanceContext } from './RefinanceContext'

export function useSdkSimulation(sdk: SDKManager) {
  const context = React.useContext(refinanceContext)
  if (context === undefined) {
    throw new Error('RefinanceContextProvider is missing in the hierarchy')
  }
  const { collateralAmount, debtAmount, positionId, slippage } = context

  const [error, setError] = useState<null | string>(null)
  const [position, setPosition] = useState<null | Position>(null)
  const [simuiation, setSimulation] = useState<null | Simulation<SimulationType.Refinance>>(null)

  useEffect(() => {
    // TODO: grab from protocol.getPool
    const positionPool = {} as any
    const position: Position = {
      pool: positionPool,
      collateralAmount,
      debtAmount,
      positionId,
      riskRatio: Percentage.createFrom({ percentage: 0 }), // TODO
    }
    setPosition(position)

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
  }, [collateralAmount, debtAmount, positionId, sdk, slippage])

  return { error, position, simuiation }
}
