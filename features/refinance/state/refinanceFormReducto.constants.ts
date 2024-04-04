import type { RefinanceFormState } from 'features/refinance/state/refinanceFormReducto.types'

export const refinanceFormReset = {
  refinanceOption: undefined,
  strategy: undefined,
  dpmProxy: undefined,
}

export const refinanceFormDefault: RefinanceFormState = {
  ...refinanceFormReset,
}
