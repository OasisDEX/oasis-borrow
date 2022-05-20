import { trackingEvents } from 'analytics/analytics'
import { OpenVaultState } from 'features/borrow/open/pipes/openVault'

interface TrackingEventOpenVaultProps {
  props: OpenVaultState
  firstCDP?: boolean
}

export function regressTrackingEvent({ props, firstCDP }: TrackingEventOpenVaultProps): void {
  const { stage } = props

  switch (stage) {
    case 'allowanceFailure':
      trackingEvents.confirmVaultEdit(firstCDP)
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
    case 'allowanceFailure':
      trackingEvents.approveAllowance(firstCDP)
      break
  }
}
