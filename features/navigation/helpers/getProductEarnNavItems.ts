import BigNumber from 'bignumber.js'
import { OmniProductType } from 'features/omni-kit/types'
import { getGenericPositionUrl } from 'features/productHub/helpers'
import { featuredProducts } from 'features/productHub/meta'
import type { ProductHubItem } from 'features/productHub/types'
import { zero } from 'helpers/zero'

export const getProductEarnNavItems = (productHub: ProductHubItem[]) => {
  return productHub
    .filter((product) =>
      featuredProducts.earn?.some(
        (featured) =>
          (featured.label ? featured.label === product.label : true) &&
          product.primaryToken === featured.primaryToken &&
          product.secondaryToken === featured.secondaryToken &&
          product.protocol === featured.protocol &&
          product.network === featured.network &&
          product.product.includes(OmniProductType.Earn),
      ),
    )
    .map((product) => ({
      weeklyNetApy: product.weeklyNetApy ? new BigNumber(product.weeklyNetApy) : undefined,
      primaryToken: product.primaryToken,
      secondaryToken: product.secondaryToken,
      protocol: product.protocol,
      network: product.network,
      earnStrategy: product.earnStrategy,
      earnStrategyDescription: product.earnStrategyDescription,
      reverseTokens: product.reverseTokens,
      url: getGenericPositionUrl({
        ...product,
        product: [OmniProductType.Earn],
      }),
    }))
    .sort((a, b) => b.weeklyNetApy?.minus(a.weeklyNetApy ?? zero).toNumber() ?? 0)
}
