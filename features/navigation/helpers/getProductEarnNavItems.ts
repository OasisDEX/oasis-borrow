import BigNumber from 'bignumber.js'
import { featuredEarnNavigationProducts } from 'features/navigation/meta'
import { OmniProductType } from 'features/omni-kit/types'
import { filterFeaturedProducts, getGenericPositionUrl } from 'features/productHub/helpers'
import type { ProductHubItem } from 'features/productHub/types'
import { zero } from 'helpers/zero'

export const getProductEarnNavItems = (productHub: ProductHubItem[]) => {
  return filterFeaturedProducts({
    filters: featuredEarnNavigationProducts,
    productType: OmniProductType.Earn,
    rows: productHub,
  })
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
