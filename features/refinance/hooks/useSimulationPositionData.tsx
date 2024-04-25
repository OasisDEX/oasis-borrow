import BigNumber from 'bignumber.js'
import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import type { RefinancePositionViewProps } from 'features/refinance/components'
import { useRefinanceContext } from 'features/refinance/contexts'
import type { RefinancePositionViewType } from 'features/refinance/types'
import { PositionUtils } from 'summerfi-sdk-client'

export const useSimulationPositionData = () => {
  const { simulation } = useRefinanceContext()

  if (simulation == null) {
    return undefined
  } else if (simulation.error) {
    console.error('Refinance simulation error', simulation.error)
    return undefined
  }

  const { simulatedPosition, liquidationPrice } = simulation
  if (!simulatedPosition || !liquidationPrice) {
    return undefined
  }
  const { collateralAmount, debtAmount } = simulatedPosition

  const collateralPrice = getTokenPrice(
    collateralAmount.token.symbol,
    tokenPriceStore.prices,
    'collateral price - refinance modal controller',
  ).toString()

  const debtPrice = getTokenPrice(
    debtAmount.token.symbol,
    tokenPriceStore.prices,
    'debt price - refinance modal controller',
  ).toString()

  const ltv = PositionUtils.getLTV({
    collateralTokenAmount: collateralAmount,
    debtTokenAmount: debtAmount,
    collateralPriceInUsd: collateralPrice,
    debtPriceInUsd: debtPrice,
  })

  const positionData:
    | null
    | RefinancePositionViewProps<RefinancePositionViewType.SIMULATION>['positionData'] = {
    ltv: new BigNumber(ltv.toString()).dividedBy(100),
    liquidationPrice: new BigNumber(liquidationPrice),
    collateral: new BigNumber(simulatedPosition.collateralAmount.amount),
    debt: new BigNumber(simulatedPosition.debtAmount.amount),
  }

  return positionData
}
