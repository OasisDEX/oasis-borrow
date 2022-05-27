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
    case 'collateralAllowanceWaitingForConfirmation':
    case 'collateralAllowanceWaitingForApproval':
    case 'collateralAllowanceInProgress':
    case 'collateralAllowanceFailure':
    case 'collateralAllowanceSuccess':
      return t('vault-form.header.allowance', { token: token.toUpperCase() })
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return t('vault-form.header.allowance', { token: 'DAI' })
    case 'txInProgress':
      return t('vault-form.header.confirm-in-progress')
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txFailure':
      return t('vault-form.header.confirm')
    case 'txSuccess':
      return t('vault-form.header.success')
    case 'collateralEditing':
    case 'daiEditing':
    case 'multiplyTransitionEditing':
    case 'multiplyTransitionWaitingForConfirmation':
    case 'multiplyTransitionInProgress':
    case 'multiplyTransitionFailure':
    case 'multiplyTransitionSuccess':
      return t('vault-form.header.manage')
    case 'manageInProgress':
      return t('vault-form.header.modified')
    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageFailure':
      return t('vault-form.header.confirm-manage')
    case 'manageSuccess':
      return t('vault-form.header.success-manage')
    default:
      throw new UnreachableCaseError(stage)
  }
}
