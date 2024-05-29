import type { ProductHubColumnKey } from 'features/productHub/types'
import { RefinanceSidebarStep } from 'features/refinance/types'

export const refinanceProductHubHiddenColumns: ProductHubColumnKey[] = [
  'automation',
  '7DayNetApy',
  'action',
]
export const refinanceProductHubItemsPerPage = 5

export const refinanceMakerSteps = [
  RefinanceSidebarStep.Option,
  RefinanceSidebarStep.Strategy,
  RefinanceSidebarStep.Dpm,
  RefinanceSidebarStep.Give,
  RefinanceSidebarStep.Changes,
]

export const refinanceStepsWithoutDpm = [
  RefinanceSidebarStep.Option,
  RefinanceSidebarStep.Strategy,
  RefinanceSidebarStep.Changes,
]
