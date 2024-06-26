import type { FormActionsReset } from 'features/omni-kit/state'
import type { ProductHubItemRefinance } from 'features/refinance/components/steps'
import type { RefinanceOptions } from 'features/refinance/types'
import type { ReductoActions } from 'helpers/useReducto'

export type DpmRefinanceFormState = {
  address: string
  id: string
}

export interface RefinanceFormState {
  refinanceOption?: RefinanceOptions
  strategy?: ProductHubItemRefinance // strip to bare minimum during clean up
  dpm?: DpmRefinanceFormState
  hasSimilarPosition?: boolean
}

export type RefinanceFormActions = ReductoActions<RefinanceFormState, FormActionsReset>
