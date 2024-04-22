import type { RefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'

export const refinanceFormReset = {
  refinanceOption: undefined,
  strategy: undefined,
  dpm: undefined,
  hasSimilarPosition: undefined,
}

export const refinanceFormDefault: RefinanceFormState = {
  ...refinanceFormReset,
}
