import { sidebarAutomationFlowSuffix } from 'features/automation/common/consts'
import type { AutomationFeatures, SidebarAutomationFlow } from 'features/automation/common/types'

export function getAutomationFormFlow({
  feature,
  isFirstSetup,
  isRemoveForm,
}: {
  feature: AutomationFeatures
  isRemoveForm: boolean
  isFirstSetup: boolean
}): SidebarAutomationFlow {
  const suffix = sidebarAutomationFlowSuffix[feature]

  return (
    isRemoveForm ? `cancel${suffix}` : isFirstSetup ? `add${suffix}` : `edit${suffix}`
  ) as SidebarAutomationFlow
}
