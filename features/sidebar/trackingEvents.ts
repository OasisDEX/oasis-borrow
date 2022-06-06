import { trackingEvents } from 'analytics/analytics'
import { BigNumber } from 'bignumber.js'
import { SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { zero } from 'helpers/zero'

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
  const {
    stage,
    proxyAddress,
    insufficientAllowance,
    depositAmount,
    generateAmount,
    paybackAmount,
    withdrawAmount,
  } = props

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
    case 'daiEditing':
      if (generateAmount?.gt(zero)) trackingEvents.manageDaiGenerateConfirm()
      else if (paybackAmount?.gt(zero)) trackingEvents.manageDaiPaybackConfirm()
      break
    case 'collateralEditing':
      if (depositAmount?.gt(zero)) trackingEvents.manageCollateralDepositConfirm()
      else if (withdrawAmount?.gt(zero)) trackingEvents.manageCollateralWithdrawConfirm()
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
