import { SidebarSectionHeaderButton } from 'components/sidebar/SidebarSectionHeader'
import { TFunction } from 'next-i18next'

interface GetResetButtonProps {
  t: TFunction
  callback?: () => void
}

export function getResetButton({
  t,
  callback,
}: GetResetButtonProps): SidebarSectionHeaderButton | undefined {
  return {
    label: t('reset'),
    icon: 'refresh',
    action: () => {
      callback!()
    },
  }
}
