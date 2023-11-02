import { trackingEvents } from 'analytics/trackingEvents'
import type { BigNumber } from 'bignumber.js'
import type { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'

interface TrackingEventOpenVaultProps {
  props: {
    stage: SidebarVaultStages
    insufficientAllowance?: boolean
    proxyAddress?: string
    depositAmount?: BigNumber
    generateAmount?: BigNumber
    paybackAmount?: BigNumber
    withdrawAmount?: BigNumber
  }
  firstCDP?: boolean
}

export function regressTrackingEvent({ props, firstCDP }: TrackingEventOpenVaultProps): void {
  const { stage } = props

  switch (stage) {
    case 'allowanceFailure':
      trackingEvents.confirmVaultEdit(firstCDP)
      break
    case 'daiAllowanceFailure':
    case 'collateralAllowanceFailure':
      trackingEvents.manageVaultConfirmVaultEdit()
      break
  }
}

export function progressTrackingEvent({ props, firstCDP }: TrackingEventOpenVaultProps): void {
  const { stage, proxyAddress, insufficientAllowance, depositAmount, generateAmount } = props

  switch (stage) {
    case 'editing':
      if (!proxyAddress)
        trackingEvents.createVaultSetupProxy(
          firstCDP,
          depositAmount?.toString() || '0',
          generateAmount?.toString() || '0',
        )
      else if (insufficientAllowance) trackingEvents.setTokenAllowance(firstCDP)
      else trackingEvents.createVaultConfirm(firstCDP)
      break
    case 'proxyWaitingForConfirmation':
      trackingEvents.createProxy(firstCDP)
      break
    case 'allowanceWaitingForConfirmation':
      trackingEvents.approveAllowance(firstCDP)
      break
    case 'collateralAllowanceWaitingForConfirmation':
      trackingEvents.manageCollateralApproveAllowance()
      break
    case 'daiAllowanceWaitingForConfirmation':
      trackingEvents.manageDaiApproveAllowance()
      break
  }
}
