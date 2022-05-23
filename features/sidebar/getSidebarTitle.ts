import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { UnreachableCaseError } from 'helpers/UnreachableCaseError'
import { useTranslation } from 'next-i18next'

type GetSidebarTitleStage = OpenVaultStage | ManageBorrowVaultStage
type GetSidebarTitleFlow = 'openBorrow' | 'manageBorrow' | 'openMultiply' | 'manageMultiply'

interface GetSidebarStageTitleParams {
  flow: GetSidebarTitleFlow
}

interface GetSidebarTitleProps {
  flow: GetSidebarTitleFlow
  stage: GetSidebarTitleStage
  token: string
}

function getSidebarEditingTranslationKey({ flow }: GetSidebarStageTitleParams) {
  switch (flow) {
    case 'openBorrow':
      return 'vault-form.header.edit'
    case 'manageBorrow':
      return 'vault-form.header.manage'
    default:
      throw new UnreachableCaseError(flow)
  }
}

export function getSidebarTitle({ flow, stage, token }: GetSidebarTitleProps): string {
  const { t } = useTranslation()

  switch (stage) {
    /* shared */
    case 'editing':
      const translationKey = getSidebarEditingTranslationKey({ flow })

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
    case 'daiAllowanceWaitingForConfirmation':
    case 'daiAllowanceWaitingForApproval':
    case 'daiAllowanceInProgress':
    case 'daiAllowanceFailure':
    case 'daiAllowanceSuccess':
      return t('vault-form.header.allowance', { token: token.toUpperCase() })
    case 'txInProgress':
      return t('vault-form.header.confirm-in-progress')
    case 'txWaitingForConfirmation':
    case 'txWaitingForApproval':
    case 'txFailure':
      return t('vault-form.header.confirm')
    case 'txSuccess':
      return t('vault-form.header.success')

    /* manage */
    case 'collateralEditing':
    case 'daiEditing':
      return t('vault-form.header.manage')
    case 'manageWaitingForConfirmation':
    case 'manageWaitingForApproval':
    case 'manageFailure':
    case 'manageSuccess':
      return t('vault-form.header.confirm-manage')
    case 'manageInProgress':
      return t('vault-form.header.modified')
    case 'multiplyTransitionEditing':
      return t('vault-form.header.go-to-multiply-summary', { token: token.toUpperCase() })
    case 'multiplyTransitionWaitingForConfirmation':
    case 'multiplyTransitionInProgress':
    case 'multiplyTransitionFailure':
    case 'multiplyTransitionSuccess':
      return t('vault-form.header.go-to-multiply-confirm')
    default:
      throw new UnreachableCaseError(stage)
  }
}
