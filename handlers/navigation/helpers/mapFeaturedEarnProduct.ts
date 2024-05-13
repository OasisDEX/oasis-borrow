import { EarnStrategies } from '@prisma/client'
import BigNumber from 'bignumber.js'
import { networksByName } from 'blockchain/networks'
import type { NavigationMenuPanelIcon } from 'components/navigation/Navigation.types'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { lendingProtocolsByName } from 'lendingProtocols/lendingProtocolsConfigs'
import { capitalize } from 'lodash'
import { i18n } from 'next-i18next'

export function mapFeaturedEarnProduct(items: ProductHubItem[]) {
  return items.map((item) => {
    const {
      depositToken,
      earnStrategy,
      earnStrategyDescription,
      network,
      primaryToken,
      protocol,
      reverseTokens,
      secondaryToken,
      weeklyNetApy,
    } = item

    if (!i18n?.t) {
      throw new Error('Failed to load translation')
    }

    const translationParams = {
      earnStrategyDescription,
      protocol: lendingProtocolsByName[protocol].label.toUpperCase(),
      token: depositToken,
    }

    const title = i18n.t(weeklyNetApy ? 'nav.earn-on-your' : 'nav.earn-on-your-simple', {
      token: depositToken,
      apy: formatDecimalAsPercent(weeklyNetApy ? new BigNumber(weeklyNetApy) : zero),
    })
    const description = i18n.t(
      earnStrategy === EarnStrategies.other
        ? 'nav.earn-on-other-strategy'
        : earnStrategy === EarnStrategies.yield_loop
          ? 'nav.earn-on-yield-loop-strategy'
          : 'nav.earn-on-generic-strategy',
      translationParams,
    )

    return {
      title,
      description,
      icon: {
        tokens:
          primaryToken === secondaryToken
            ? [primaryToken]
            : reverseTokens
              ? [secondaryToken, primaryToken]
              : [primaryToken, secondaryToken],
        position: 'global' as NavigationMenuPanelIcon['position'],
      },
      tags: [
        [
          earnStrategy === EarnStrategies.erc_4626
            ? earnStrategyDescription
            : lendingProtocolsByName[protocol].label,
          lendingProtocolsByName[protocol].gradient,
        ],
        [capitalize(network), networksByName[network].gradient],
      ],
      url: getGenericPositionUrl({
        ...item,
        product: [OmniProductType.Earn],
      }),
    }
  })
}
