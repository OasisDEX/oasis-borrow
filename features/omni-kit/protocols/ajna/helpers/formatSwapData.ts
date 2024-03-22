import type { OmniSimulationSwap } from '@oasisdex/dma-library'

export const formatSwapData = ({
  swapData,
  fromTokenPrecision,
  toTokenPrecision,
}: {
  swapData?: OmniSimulationSwap
  fromTokenPrecision: number
  toTokenPrecision: number
}) => {
  if (!swapData) return undefined

  return {
    ...swapData,
    fromTokenAmount: swapData.fromTokenAmount.shiftedBy(-fromTokenPrecision),
    toTokenAmount: swapData.toTokenAmount.shiftedBy(-toTokenPrecision),
    minToTokenAmount: swapData.minToTokenAmount.shiftedBy(-toTokenPrecision),
  }
}
