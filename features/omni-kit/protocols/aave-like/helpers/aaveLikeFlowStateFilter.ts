import type { OmniFlowStateFilterParams } from 'features/omni-kit/types'

// We don't allow to reuse dpm proxy
export function aaveLikeFlowStateFilter(_params: OmniFlowStateFilterParams): boolean {
  return false
}
