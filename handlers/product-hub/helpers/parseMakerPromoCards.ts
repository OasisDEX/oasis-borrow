import BigNumber from 'bignumber.js'
import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps } from 'components/PromoCard'
import { getActionUrl } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { LendingProtocol } from 'lendingProtocols'

const protocol = { network: NetworkNames.ethereumMainnet, protocol: LendingProtocol.Maker }

export function parseMakerBorrowPromoCard(
  collateralToken: string,
  debtToken: string,
  product?: ProductHubItem,
): PromoCardProps {
  return {
    tokens: [collateralToken, debtToken],
    title: {
      key: 'product-hub.promo-cards.borrow-against',
      props: { collateralToken, debtToken },
    },
    protocol,
    ...(product && {
      link: {
        href: getActionUrl({ ...product, product: [ProductHubProductType.Borrow] }),
      },
    }),
    ...(product?.fee && {
      data: [
        {
          label: { key: 'product-hub.promo-cards.borrow-rate' },
          value: formatDecimalAsPercent(new BigNumber(product.fee)),
        },
      ],
    }),
  }
}

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
