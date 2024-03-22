import type { LendingPosition } from '@oasisdex/dma-library'
import type { OmniSimulationSwap } from 'features/omni-kit/types'

export const resolveSwapTokenPrice = ({
  positionData,
  simulationData,
  swapData,
}: {
  positionData: LendingPosition
  simulationData?: LendingPosition
  swapData?: OmniSimulationSwap
}) => {
  if (!simulationData || !swapData) {
    return undefined
  }

  return simulationData.riskRatio.loanToValue.gt(positionData.riskRatio.loanToValue)
    ? swapData.fromTokenAmount.div(swapData.toTokenAmount)
    : swapData.toTokenAmount.div(swapData.fromTokenAmount)
}
