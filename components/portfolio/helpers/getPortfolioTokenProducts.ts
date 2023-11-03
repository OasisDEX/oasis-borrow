import type { NetworkNames } from 'blockchain/networks'
import type { ProductType } from 'features/aave/types'
import type { ProductHubItem } from 'features/productHub/types'
import { uniq } from 'lodash'

interface GetPortfolioTokenProductsParams {
  network: NetworkNames
  table: ProductHubItem[]
  token: string
}

export function getPortfolioTokenProducts({
  network,
  table,
  token,
}: GetPortfolioTokenProductsParams) {
  return uniq(
    table.reduce<ProductType[]>(
      (result, { network: productNetwork, primaryToken, product, secondaryToken }) => {
        return [
          ...result,
          ...([primaryToken, secondaryToken].includes(token.toUpperCase()) &&
          network === productNetwork
            ? [...(product as unknown as ProductType[])]
            : []),
        ]
      },
      [],
    ),
  )
}
