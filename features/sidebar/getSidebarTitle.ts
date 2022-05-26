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
    case 'openMultiply':
      return 'vault-form.header.edit'
    case 'addSl':
    case 'adjustSl':
      return 'protection.set-downside-protection'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxSuccessTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'vault-form.header.success'
    case 'addSl':
      return 'protection.downside-protection-complete'
    case 'adjustSl':
      return 'protection.downside-protection-updated'
    default:
      throw new UnreachableCaseError(flow)
  }
}

function getSidebarTitleTxInProgressTranslationKey({ flow }: { flow: SidebarFlow }) {
  switch (flow) {
    case 'openBorrow':
    case 'openMultiply':
      return 'vault-form.header.confirm-in-progress'
    case 'addSl':
    case 'adjustSl':
      return 'protection.setting-downside-protection'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarTitle({ flow, stage, token }: GetSidebarTitleParams) {
  const { t } = useTranslation()

  switch (stage) {
    case 'editing':
      const editingKey = getSidebarTitleEditingTranslationKey({ flow })

      return t(editingKey)
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
      const txInProgressKey = getSidebarTitleTxInProgressTranslationKey({ flow })

      return t(txInProgressKey)
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txFailure':
      return t('vault-form.header.confirm')
    case 'txSuccess':
      const txSuccessKey = getSidebarTitleTxSuccessTranslationKey({ flow })

      return t(txSuccessKey)
    default:
      throw new UnreachableCaseError(stage)
  }
}
