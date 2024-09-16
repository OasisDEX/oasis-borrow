import BigNumber from 'bignumber.js'
import { networksByName } from 'blockchain/networks'
import type {
  NavigationMenuPanelIcon,
  NavigationMenuPanelListItem,
} from 'components/navigation/Navigation.types'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { zero } from 'helpers/zero'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { capitalize } from 'lodash'
import { i18n } from 'next-i18next'

export function mapFeaturedMultiplyProduct(items: ProductHubItem[]): NavigationMenuPanelListItem[] {
  return items.map((item) => {
    const { maxMultiply, network, primaryToken, protocol, secondaryToken } = item

    if (!i18n?.t) {
      throw new Error('Failed to load translation')
    }

    const title = i18n.t(maxMultiply ? 'nav.multiply-get-up-to' : 'nav.multiply-exposure', {
      maxMultiply: new BigNumber(maxMultiply ?? zero).toFixed(2),
      collateralToken: primaryToken,
      debtToken: secondaryToken,
    })
    const description = i18n.t('nav.increase-your-exposure-against', { token: secondaryToken })

    return {
      title,
      description,
      icon: {
        tokens: [primaryToken, secondaryToken],
        position: 'global' as NavigationMenuPanelIcon['position'],
      },
      tags: [
        [lendingProtocolsByName[protocol].label, lendingProtocolsByName[protocol].gradient],
        [capitalize(network), networksByName[network].gradient],
      ],
      url: getGenericPositionUrl({
        ...item,
        product: [OmniProductType.Multiply],
      }),
    }
  })
}
