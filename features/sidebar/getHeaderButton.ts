import { SidebarSectionHeaderButton } from 'components/sidebar/SidebarSectionHeader'
import { ManageBorrowVaultStage } from 'features/borrow/manage/pipes/manageVault'
import { OpenVaultStage } from 'features/borrow/open/pipes/openVault'
import { ManageMultiplyVaultStage } from 'features/multiply/manage/pipes/manageMultiplyVault'
import { useTranslation } from 'next-i18next'

interface GetHeaderButtonProps {
  stage: OpenVaultStage | ManageBorrowVaultStage | ManageMultiplyVaultStage
  canResetForm?: boolean
  resetForm?: () => void
  canRegress?: boolean
  regress?: () => void
  regressCallback?: () => void
}

export function getHeaderButton({
  stage,
  canResetForm,
  resetForm,
  canRegress,
  regress,
  regressCallback,
}: GetHeaderButtonProps): SidebarSectionHeaderButton | undefined {
  const { t } = useTranslation()

  const isPastAllowanceSettings = [
    'allowanceWaitingForApproval',
    'allowanceInProgress',
    'allowanceFailure',
  ].includes(stage)

  if (canResetForm) {
    return {
      label: t('reset'),
      icon: 'refresh',
      action: resetForm!,
    }
  } else if (canRegress) {
    return {
      label: isPastAllowanceSettings ? t('edit-allowance') : t('edit-vault'),
      icon: 'edit',
      action: () => {
        regress!()
        regressCallback!()
      },
    }
  } else return undefined
}
