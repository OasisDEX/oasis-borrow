import type { OmniSimulationSwap } from 'features/omni-kit/types'

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
    fromTokenAmountRaw: swapData.fromTokenAmount,
    toTokenAmount: swapData.toTokenAmount.shiftedBy(-toTokenPrecision),
    toTokenAmountRaw: swapData.toTokenAmount,
    minToTokenAmount: swapData.minToTokenAmount.shiftedBy(-toTokenPrecision),
    minToTokenAmountRaw: swapData.minToTokenAmount,
  }
}
