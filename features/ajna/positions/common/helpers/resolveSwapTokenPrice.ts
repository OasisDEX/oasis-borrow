import type { BorrowishPosition, SwapData } from '@oasisdex/dma-library'

export const resolveSwapTokenPrice = ({
  positionData,
  simulationData,
  swapData,
}: {
  positionData: BorrowishPosition
  simulationData?: BorrowishPosition
  swapData?: SwapData
}) => {
  if (!simulationData || !swapData) {
    return undefined
  }

  return simulationData.riskRatio.loanToValue.gt(positionData.riskRatio.loanToValue)
    ? swapData.fromTokenAmount.div(swapData.toTokenAmount)
    : swapData.toTokenAmount.div(swapData.fromTokenAmount)
}
