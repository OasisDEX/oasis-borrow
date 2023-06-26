import { SwapData } from '@oasisdex/dma-library'

export const formatSwapData = ({
  swapData,
  quotePrecision,
  collateralPrecision,
}: {
  swapData?: SwapData
  quotePrecision: number
  collateralPrecision: number
}) => {
  if (!swapData) return undefined

  return {
    ...swapData,
    fromTokenAmount: swapData.fromTokenAmount.shiftedBy(-quotePrecision),
    toTokenAmount: swapData.toTokenAmount.shiftedBy(-collateralPrecision),
    minToTokenAmount: swapData.minToTokenAmount.shiftedBy(-collateralPrecision),
  }
}
