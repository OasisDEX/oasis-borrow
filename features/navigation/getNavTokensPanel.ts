import type { NavigationMenuPanelType } from 'components/navigation/NavigationMenuPanel'
import {
  getNavIconConfig,
  getNavTokensDataPerToken,
  getNavTokensNestedListItem,
} from 'features/navigation/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { TranslationType } from 'ts_modules/i18next'
import type { AppConfigType } from 'types/config'

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
      items: [
        ...navigation.tokens.popular.map((token) => ({
          title: token,
          icon: getNavIconConfig({ tokens: [token], position: 'title' }),
          list: getNavTokensNestedListItem(
            t,
            token,
            getNavTokensDataPerToken(token, productHubItems),
          ),
        })),
      ],
      tight: true,
    },
    {
      header: t('nav.tokens-new'),
      items: [
        ...navigation.tokens.new.map((token) => ({
          title: token,
          icon: getNavIconConfig({ tokens: [token], position: 'title' }),
          list: getNavTokensNestedListItem(
            t,
            token,
            getNavTokensDataPerToken(token, productHubItems),
          ),
        })),
      ],
      link: {
        label: t('nav.tokens-link'),
        url: INTERNAL_LINKS.ajnaPoolFinder,
      },
      tight: true,
    },
  ],
})
