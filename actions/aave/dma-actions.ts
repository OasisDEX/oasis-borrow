import {
  ISimplePositionTransition,
  ISimulatedTransition,
  PositionTransition,
} from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'

export function transitionHasSwap(
  transition?: ISimplePositionTransition,
): transition is PositionTransition {
  return !!transition && (transition.simulation as ISimulatedTransition).swap !== undefined
}

export function transitionHasMinConfigurableRiskRatio(
  transition?: ISimplePositionTransition,
): transition is PositionTransition {
  return (
    !!transition &&
    (transition.simulation as ISimulatedTransition).minConfigurableRiskRatio !== undefined
  )
}

// library works with a normalised precision of 18, and is sometimes exposed in the API.
export const NORMALISED_PRECISION = new BigNumber(18)
