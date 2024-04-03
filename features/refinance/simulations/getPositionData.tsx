import BigNumber from 'bignumber.js'
import type { RefinancePositionViewProps } from 'features/refinance/components'
import { useSdkSimulation } from 'features/refinance/simulations/useSdkSimulation'
import type { RefinancePositionViewType } from 'features/refinance/types'
import { PositionUtils } from 'summerfi-sdk-client'
import { CurrencySymbol, Price } from 'summerfi-sdk-common'

export const useSimulationPositionData = () => {
  const simulation = useSdkSimulation()

  if (simulation == null) {
    return null
  } else if (simulation.error) {
    console.error(simulation.error)
    return null
  }

  const { context, targetPosition, liquidationPrice } = simulation
  if (!targetPosition || !liquidationPrice || !context) {
    return null
  }
  const { collateralAmount, debtAmount } = targetPosition
  const {
    environment: { collateralPrice, debtPrice },
  } = context

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
