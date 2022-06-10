import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

interface IsDropdownDisabledParams {
  stage: SidebarVaultStages
  isSLPanelVisible?: boolean
}

export function isDropdownDisabled({ stage, isSLPanelVisible = false }: IsDropdownDisabledParams) {
  if (isSLPanelVisible) return true

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
