import type { SwapData } from '@oasisdex/dma-library'

interface ResolveIfCachedSwapParams {
  cached: boolean
  currentSwap?: SwapData
  cachedSwap?: SwapData
}

export const resolveIfCachedSwap = ({
  cached,
  currentSwap,
  cachedSwap,
}: ResolveIfCachedSwapParams) => (cached && cachedSwap ? cachedSwap : currentSwap)
