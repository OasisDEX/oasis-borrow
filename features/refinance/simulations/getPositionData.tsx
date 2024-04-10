import BigNumber from 'bignumber.js'
import type { RefinancePositionViewProps } from 'features/refinance/components'
import { useRefinanceContext } from 'features/refinance/contexts'
import { useSdkSimulation } from 'features/refinance/simulations/useSdkSimulation'
import type { RefinancePositionViewType } from 'features/refinance/types'
import { PositionUtils } from 'summerfi-sdk-client'
import { CurrencySymbol, Price } from 'summerfi-sdk-common'

export const useSimulationPositionData = () => {
  const simulation = useSdkSimulation()
  const {
    environment: { collateralPrice, debtPrice },
  } = useRefinanceContext()

  if (simulation == null) {
    return undefined
  } else if (simulation.error) {
    console.error('Refinance simulation error', simulation.error)
    return undefined
  }

  const { targetPosition, liquidationPrice } = simulation
  if (!targetPosition || !liquidationPrice) {
    return undefined
  }
  const { collateralAmount, debtAmount } = targetPosition

  const ltv = PositionUtils.getLTV({
    collateralTokenAmount: collateralAmount,
    debtTokenAmount: debtAmount,
    collateralPriceInUsd: Price.createFrom({
      value: collateralPrice,
      baseToken: collateralAmount.token,
      quoteToken: CurrencySymbol.USD,
    }),
    debtPriceInUsd: Price.createFrom({
      value: debtPrice,
      baseToken: debtAmount.token,
      quoteToken: CurrencySymbol.USD,
    }),
  })

  const positionData:
    | null
    | RefinancePositionViewProps<RefinancePositionViewType.SIMULATION>['positionData'] = {
    ltv: new BigNumber(ltv),
    liquidationPrice: new BigNumber(liquidationPrice),
    collateral: new BigNumber(targetPosition.collateralAmount.amount),
    debt: new BigNumber(targetPosition.debtAmount.amount),
  }

  return positionData
}
