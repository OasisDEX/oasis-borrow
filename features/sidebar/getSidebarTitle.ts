import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { useTranslation } from 'next-i18next'

interface GetSidebarTitleProps {
  stage: OpenVaultStage
  token: string
}

export function getSidebarTitle({ stage, token }: GetSidebarTitleProps): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      return t('vault-form.header.edit')
    case 'proxyInProgress':
      return t('vault-form.header.proxy-in-progress')
    case 'proxyWaitingForConfirmation':
    case 'proxyWaitingForApproval':
    case 'proxyFailure':
      return t('vault-form.header.proxy')
    case 'proxySuccess':
      return t('vault-form.header.proxy-success')
    case 'allowanceWaitingForConfirmation':
    case 'allowanceWaitingForApproval':
    case 'allowanceInProgress':
    case 'allowanceFailure':
    case 'allowanceSuccess':
      return t('vault-form.header.allowance', { token: token.toUpperCase() })
    case 'txInProgress':
      return t('vault-form.header.confirm-in-progress')
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txFailure':
      return t('vault-form.header.confirm')
    case 'txSuccess':
      return t('vault-form.header.success')
    default:
      return ''
  }
}
