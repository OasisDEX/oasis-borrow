import type { FormActionsReset } from 'features/omni-kit/state'
import type { ProductHubItem } from 'features/productHub/types'
import type { RefinanceOptions } from 'features/refinance/types'
import type { ReductoActions } from 'helpers/useReducto'

export interface RefinanceFormState {
  refinanceOption?: RefinanceOptions
  strategy?: ProductHubItem // strip to bare minimum during clean up
  dpmProxy?: string
  hasSimilarPosition?: boolean
}

export type RefinanceFormActions = ReductoActions<RefinanceFormState, FormActionsReset>
