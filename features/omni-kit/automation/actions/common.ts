import type { OmniAutomationSimulationResponse } from 'features/omni-kit/types'

export const defaultAutomationActionPromise = Promise.resolve<
  OmniAutomationSimulationResponse | undefined
>(undefined)
