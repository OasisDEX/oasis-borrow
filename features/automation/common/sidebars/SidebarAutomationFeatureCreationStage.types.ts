import type { AutomationFeatures } from 'features/automation/common/types'
import type { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import type { ReactElement } from 'react'

export interface SidebarAutomationFeatureCreationStageProps {
  featureName: AutomationFeatures
  stage: SidebarVaultStages
  isAddForm: boolean
  isRemoveForm: boolean
  customContent?: ReactElement
}
