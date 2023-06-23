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
