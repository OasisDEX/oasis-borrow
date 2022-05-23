import { GetPrimaryButtonLabelParams } from 'helpers/extractSidebarHelpers'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

export function getPrimaryButtonLabel({
  stage,
  id,
  token,
  proxyAddress,
  insufficientAllowance,
}: GetPrimaryButtonLabelParams): string {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      if (!proxyAddress) return t('setup-proxy')
      else if (insufficientAllowance) return t('set-token-allowance', { token })
      else return t('confirm')
    case 'proxyWaitingForConfirmation':
      return t('create-proxy-btn')
    case 'proxyWaitingForApproval':
    case 'proxyInProgress':
      return t('creating-proxy')
    case 'proxyFailure':
      return t('retry-create-proxy')
    case 'proxySuccess':
      return insufficientAllowance ? t('set-token-allowance', { token }) : t('continue')
    case 'allowanceWaitingForConfirmation':
      return t('set-token-allowance', { token: token })
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
      return t('go-to-vault', { id })
    case 'txWaitingForApproval':
    case 'txWaitingForConfirmation':
      return t('create-vault')
    default:
      throw new UnreachableCaseError(stage)
  }
}
