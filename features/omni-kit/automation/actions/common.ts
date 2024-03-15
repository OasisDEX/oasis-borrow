import type { OmniAutomationSimulationResponse } from 'features/omni-kit/contexts'

export const defaultAutomationActionPromise = Promise.resolve<
  OmniAutomationSimulationResponse | undefined
>(undefined)
