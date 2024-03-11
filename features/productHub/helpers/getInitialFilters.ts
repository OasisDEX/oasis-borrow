import type {
  ProductHubFilters,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import { ProductHubProductType } from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetInitialFiltersParams {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  initialQueryString: ProductHubQueryString
  selectedProduct: ProductHubProductType
  token?: string
}

export function getInitialFilters({
  initialNetwork,
  initialProtocol,
  initialQueryString,
  selectedProduct,
  token,
}: GetInitialFiltersParams): ProductHubFilters {
  return {
    or: [
      ...(selectedProduct === ProductHubProductType.Multiply && initialQueryString.secondaryToken
        ? token
          ? [
              { primaryTokenGroup: [token], secondaryToken: initialQueryString.secondaryToken },
              { primaryToken: [token], secondaryToken: initialQueryString.secondaryToken },
              { primaryToken: initialQueryString.secondaryToken, secondaryToken: [token] },
              { primaryToken: initialQueryString.secondaryToken, secondaryTokenGroup: [token] },
            ]
          : [
              { primaryToken: initialQueryString.secondaryToken },
              { secondaryToken: initialQueryString.secondaryToken },
            ]
        : []),
    ],
    and: {
      ...(initialNetwork && { network: initialNetwork }),
      ...(initialProtocol && { protocol: initialProtocol }),
      ...(selectedProduct === ProductHubProductType.Borrow &&
        initialQueryString.debtToken && { secondaryToken: initialQueryString.debtToken }),
      ...(selectedProduct === ProductHubProductType.Multiply &&
        initialQueryString.strategy && { multiplyStrategyType: initialQueryString.strategy }),
      ...(initialQueryString.network && { network: initialQueryString.network }),
      ...(initialQueryString.protocol && { protocol: initialQueryString.protocol }),
      ...(initialQueryString.rewardsOnly && { hasRewards: [true] }),
    },
  }
}
