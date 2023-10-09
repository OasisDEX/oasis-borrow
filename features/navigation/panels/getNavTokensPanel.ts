import type { NavigationMenuPanelType } from 'components/navigation/Navigation.types'
import {
  getNavIconConfig,
  getNavTokensDataPerToken,
  getNavTokensNestedListItem,
} from 'features/navigation/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import type { TranslationType } from 'ts_modules/i18next'
import type { AppConfigType } from 'types/config'

const mapNavigationTokens = ({
  navigation,
  type,
  productHubItems,
  t,
}: {
  navigation: AppConfigType['navigation']
  type: 'new' | 'popular'
  productHubItems: ProductHubItem[]
  t: TranslationType
}) => [
  ...navigation.tokens[type].map((token) => ({
    title: token,
    icon: getNavIconConfig({ tokens: [token], position: 'title' }),
    list: getNavTokensNestedListItem(t, token, getNavTokensDataPerToken(token, productHubItems)),
  })),
]

const { AjnaSafetySwitch } = getLocalAppConfig('features')

export const getNavTokensPanel = ({
  t,
  navigation,
  productHubItems,
}: {
  t: TranslationType
  navigation: AppConfigType['navigation']
  productHubItems: ProductHubItem[]
}): NavigationMenuPanelType => ({
  label: t('nav.tokens'),
  lists: [
    {
      header: t('nav.tokens-popular'),
      items: mapNavigationTokens({ navigation, type: 'popular', productHubItems, t }),
      tight: true,
    },
    {
      header: t('nav.tokens-new'),
      items: mapNavigationTokens({ navigation, type: 'new', productHubItems, t }),
      ...(!AjnaSafetySwitch && {
        link: {
          label: t('nav.tokens-link'),
          url: INTERNAL_LINKS.ajnaPoolFinder,
        },
      }),
      tight: true,
    },
  ],
})
