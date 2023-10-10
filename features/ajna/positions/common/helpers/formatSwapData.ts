import type { SwapData } from '@oasisdex/dma-library'

export const formatSwapData = ({
  swapData,
  fromTokenPrecision,
  toTokenPrecision,
}: {
  swapData?: SwapData
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
