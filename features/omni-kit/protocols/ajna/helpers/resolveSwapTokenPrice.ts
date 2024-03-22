import type { LendingPosition, OmniSimulationSwap } from '@oasisdex/dma-library'

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
