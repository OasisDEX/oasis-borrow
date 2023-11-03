import type { NetworkNames } from 'blockchain/networks'
import { ProductType } from 'features/aave/types'
import type { ProductHubItem } from 'features/productHub/types'
import { uniq, upperFirst } from 'lodash'

interface GetPortfolioTokenProductsParams {
  network: NetworkNames
  table: ProductHubItem[]
  token: string
}

const sortingOrder = [ProductType.Earn, ProductType.Borrow, ProductType.Multiply]

export function getPortfolioTokenProducts({
  network,
  table,
  token,
}: GetPortfolioTokenProductsParams) {
  const resolvedToken = token === 'WETH' ? 'ETH' : token

  return uniq(
    table.reduce<string[]>(
      (result, { network: productNetwork, primaryToken, product, secondaryToken }) => [
        ...result,
        ...([primaryToken, secondaryToken].includes(resolvedToken.toUpperCase()) &&
        network === productNetwork
          ? [...product]
          : []),
      ],
      [],
    ),
  )
    .map((product) => upperFirst(product) as ProductType)
    .sort((a, b) => sortingOrder.indexOf(a) - sortingOrder.indexOf(b))
}
