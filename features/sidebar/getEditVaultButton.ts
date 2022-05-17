import { SidebarSectionHeaderButton } from 'components/sidebar/SidebarSectionHeader'
import { TFunction } from 'next-i18next'

interface GetEditVaultButtonProps {
  t: TFunction
  regress?: () => void
  callback?: () => void
}

export function getEditVaultButton({
  t,
  regress,
  callback,
}: GetEditVaultButtonProps): SidebarSectionHeaderButton | undefined {
  return {
    label: t('edit-vault'),
    icon: 'edit',
    action: () => {
      regress!()
      callback!()
    },
  }
}
