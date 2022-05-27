import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

interface IsDropdownDisabledParams {
  stage: SidebarVaultStages
}

export function isDropdownDisabled({ stage }: IsDropdownDisabledParams) {
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
    case 'manageInProgress':
    case 'manageWaitingForApproval':
      return true
    default:
      return false
  }
}
