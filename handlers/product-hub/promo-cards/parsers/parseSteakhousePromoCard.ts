import BigNumber from 'bignumber.js'
import type { PromoCardProps } from 'components/PromoCard.types'
import { getActionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

interface ParseSteakhousePromoCardParams {
  token: string
  product?: ProductHubItem
}

export function parseSteakhousePromoCard({
  product,
  token,
}: ParseSteakhousePromoCardParams): PromoCardProps {
  return {
    tokens: [token],
    title: `Steakhouse ${token}`,
    protocol: {
      network: product?.network,
      protocol: LendingProtocol.MorphoBlue,
    },
    ...(product && {
      link: {
        href: getActionUrl(product),
      },
    }),
    pills: [
      {
        label: { key: 'product-hub.promo-cards.steakhouse-managed' },
      },
      {
        label: { key: 'product-hub.promo-cards.token-rewards' },
        variant: 'positive',
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
