import { PositionUtils } from '@summer_fi/summerfi-sdk-client'
import BigNumber from 'bignumber.js'
import { getTokenPrice } from 'blockchain/prices'
import { tokenPriceStore } from 'blockchain/prices.constants'
import type { RefinancePositionViewProps } from 'features/refinance/components'
import { useRefinanceContext } from 'features/refinance/contexts'
import type { RefinancePositionViewType } from 'features/refinance/types'

export const useSimulationPositionData = () => {
  const {
    simulation,
    form: {
      state: { strategy },
    },
  } = useRefinanceContext()

  if (simulation == null) {
    return undefined
  } else if (simulation.error) {
    console.error('Refinance simulation error', simulation.error)
    return undefined
  }

  const { refinanceSimulation, liquidationPrice } = simulation
  if (!refinanceSimulation || !liquidationPrice) {
    return undefined
  }
  const targetPosition = refinanceSimulation.targetPosition
  const { collateralAmount, debtAmount } = targetPosition

  const collateralPrice = getTokenPrice(
    collateralAmount.token.symbol.toUpperCase(),
    tokenPriceStore.prices,
    'collateral price - refinance modal controller',
  ).toString()

  const debtPrice = getTokenPrice(
    debtAmount.token.symbol.toUpperCase(),
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
    ltv: new BigNumber(ltv.value).dividedBy(100),
    liquidationPrice: new BigNumber(liquidationPrice),
    collateral: new BigNumber(targetPosition.collateralAmount.amount),
    debt: new BigNumber(targetPosition.debtAmount.amount),
    netApy: strategy?.netApy ? new BigNumber(strategy?.netApy) : undefined,
  }

  return positionData
}
