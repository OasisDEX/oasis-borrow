import type { OmniSimulationSwap } from 'features/omni-kit/types'

interface ResolveIfCachedSwapParams {
  cached: boolean
  currentSwap?: OmniSimulationSwap
  cachedSwap?: OmniSimulationSwap
}

export const resolveIfCachedSwap = ({
  cached,
  currentSwap,
  cachedSwap,
}: ResolveIfCachedSwapParams) => (cached && cachedSwap ? cachedSwap : currentSwap)
