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
    toTokenAmount: swapData.toTokenAmount.shiftedBy(-toTokenPrecision),
    minToTokenAmount: swapData.minToTokenAmount.shiftedBy(-toTokenPrecision),
  }
}
