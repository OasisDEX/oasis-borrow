import { SidebarSectionHeaderButton } from 'components/sidebar/SidebarSectionHeader'
import { useTranslation } from 'next-i18next'

interface GetHeaderButtonProps {
  canResetForm?: boolean
  resetForm?: () => void
  canRegress?: boolean
  regress?: () => void
  regressCallback?: () => void
}

export function getHeaderButton({
  canResetForm,
  resetForm,
  canRegress,
  regress,
  regressCallback,
}: GetHeaderButtonProps): SidebarSectionHeaderButton | undefined {
  const { t } = useTranslation()

  if (canResetForm) {
    return {
      label: t('reset'),
      icon: 'refresh',
      action: resetForm!,
    }
  } else if (canRegress) {
    return {
      label: t('edit-vault'),
      icon: 'edit',
      action: () => {
        regress!()
        regressCallback!()
      },
    }
  } else return undefined
}
