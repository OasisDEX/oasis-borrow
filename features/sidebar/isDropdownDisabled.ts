import { SidebarAutomationStages } from 'features/automation/common/types'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

interface IsDropdownDisabledParams {
  stage: SidebarVaultStages | SidebarAutomationStages
  isClosedVaultPanelVisible?: boolean
}

export function isDropdownDisabled({
  stage,
  isClosedVaultPanelVisible = false,
}: IsDropdownDisabledParams) {
  if (isClosedVaultPanelVisible) return true

  switch (stage) {
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'txInProgress':
    case 'txWaitingForApproval':
    case 'multiplyTransitionInProgress':
    case 'multiplyTransitionSuccess':
    case 'borrowTransitionInProgress':
    case 'borrowTransitionSuccess':
    case 'manageInProgress':
    case 'manageWaitingForApproval':
      return true
    default:
      return false
  }
}
