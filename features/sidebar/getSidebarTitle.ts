import { SidebarFlow, SidebarVaultStages } from 'features/types/vaults/sidebarLabels'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

interface GetSidebarTitleParams {
  flow: SidebarFlow
  stage: SidebarVaultStages
  token: string
}

function getSidebarTitleEditingTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
      return 'vault-form.header.edit'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarTitle({ flow, stage, token }: GetSidebarTitleParams) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      const translationKey = getSidebarTitleEditingTranslationKey({ flow })

      return t(translationKey)
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
      throw new UnreachableCaseError(stage)
  }
}
