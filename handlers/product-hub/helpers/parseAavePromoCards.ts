import { NetworkNames } from 'blockchain/networks'
import { PromoCardProps } from 'components/PromoCard'
import { getActionUrl } from 'features/productHub/helpers'
import { ProductHubItem, ProductHubProductType } from 'features/productHub/types'
import { LendingProtocol } from 'lendingProtocols'

export function parseAaveV3MultiplyPromoCard(
  collateralToken: string,
  debtToken: string,
  product?: ProductHubItem,
): PromoCardProps {
  return {
    tokens: [collateralToken, debtToken],
    title: `${collateralToken}/${debtToken}`,
    description: {
      key: 'product-hub.promo-cards.up-to-exposure-against',
      props: { collateralToken, debtToken, maxMultiple: '5x' },
    },
    protocol: {
      network: NetworkNames.ethereumMainnet,
      protocol: LendingProtocol.AaveV3,
    },
    ...(product && {
      link: {
        href: getActionUrl({ ...product, product: [ProductHubProductType.Multiply] }),
      },
    }),
  }
}
