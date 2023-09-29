import type { NavigationMenuPanelType } from 'components/navigation/Navigation.types'
import { getNavUseCasesItems } from 'features/navigation/helpers'
import type { TranslationType } from 'ts_modules/i18next'

export const getNavUseCasesPanel = ({ t }: { t: TranslationType }): NavigationMenuPanelType => ({
  label: t('nav.use-cases'),
  lists: [
    {
      items: getNavUseCasesItems(t),
    },
  ],
})
