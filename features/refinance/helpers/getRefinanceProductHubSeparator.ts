import type { AssetsTableSeparatorStatic } from 'components/assetsTable/types'
import type { ProductHubItem } from 'features/productHub/types'
import { refinanceProductHubItemsPerPage } from 'features/refinance/constants'

export const getRefinanceProductHubSeparator = ({
  table,
  collateralToken,
  debtToken,
}: {
  table: ProductHubItem[]
  collateralToken: string
  debtToken: string
}): AssetsTableSeparatorStatic | undefined => {
  const index = table.filter(
    (item) => item.primaryToken === collateralToken && item.secondaryToken === debtToken,
  ).length

  return index !== refinanceProductHubItemsPerPage && index !== 0
    ? {
        index,
      }
    : undefined
}
