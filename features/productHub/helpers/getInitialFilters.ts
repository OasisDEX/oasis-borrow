import type {
  ProductHubFilters,
  ProductHubQueryString,
  ProductHubSupportedNetworks,
} from 'features/productHub/types'
import type { LendingProtocol } from 'lendingProtocols'

interface GetInitialFiltersParams {
  initialNetwork?: ProductHubSupportedNetworks[]
  initialProtocol?: LendingProtocol[]
  initialQueryString: ProductHubQueryString
}

export function getInitialFilters({
  initialNetwork,
  initialProtocol,
  initialQueryString,
}: GetInitialFiltersParams): ProductHubFilters {
  return {
    or: [],
    and: {
      ...(initialNetwork && { network: initialNetwork }),
      ...(initialProtocol && { protocol: initialProtocol }),
      ...(initialQueryString.network && { network: initialQueryString.network }),
      ...(initialQueryString.protocol && { protocol: initialQueryString.protocol }),
    },
  }
}
