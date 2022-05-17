import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'

interface GetPrimaryButtonLabelProps {
  stage: OpenVaultStage
  token: string
}

export function getPrimaryButtonLabel({ stage }: GetPrimaryButtonLabelProps): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      return t('confirm')
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxySuccess':
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
      return t('approving-allowance')
    case 'allowanceFailure':
      return t('retry-allowance-approval')
    case 'allowanceSuccess':
      return t('continue')
    case 'txFailure':
      return t('retry')
    case 'txInProgress':
      return t('creating-vault')
    case 'txSuccess':
      return t('go-to-vault')
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    default:
      return 'Unhandled label'
  }
}
