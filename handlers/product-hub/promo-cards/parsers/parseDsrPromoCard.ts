import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import type { PromoCardProps } from 'components/PromoCard.types'
import { getActionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

export function parseDsrPromoCard(product?: ProductHubItem): PromoCardProps {
  return {
    tokens: ['DAI'],
    title: { key: 'product-hub.promo-cards.earn-on-your-dai' },
    protocol: { network: NetworkNames.ethereumMainnet, protocol: LendingProtocol.Maker },
    ...(product && {
      link: {
        href: getActionUrl(product),
      },
    }),
    pills: [
      {
        label: { key: 'product-hub.promo-cards.lower-risk-strategy' },
      },
      {
        label: { key: 'product-hub.promo-cards.passive-management' },
      },
    ],
    ...(product?.weeklyNetApy && {
      data: [
        {
          label: { key: 'product-hub.promo-cards.7-day-avg-apy' },
          value: formatDecimalAsPercent(new BigNumber(product.weeklyNetApy)),
        },
      ],
    }),
  }
}
