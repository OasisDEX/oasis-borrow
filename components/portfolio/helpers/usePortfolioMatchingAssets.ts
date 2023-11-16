import { usePreloadAppDataContext } from 'components/context/PreloadAppDataContextProvider'
import { getPortfolioTokenProducts } from 'components/portfolio/helpers/getPortfolioTokenProducts'
import { uniq } from 'lodash'
import { useMemo } from 'react'

import type { PortfolioAsset } from 'lambdas/lib/shared/src/domain-types'

export const usePortfolioMatchingAssets = ({ assets }: { assets?: PortfolioAsset[] }) => {
  const {
    productHub: { table },
  } = usePreloadAppDataContext()
  const matchingAssets = useMemo(
    () =>
      assets?.filter(
        ({ network, symbol }) =>
          getPortfolioTokenProducts({ network, table, token: symbol }).length,
      ),
    [assets, table],
  )
  const matchingTopAssets = useMemo(
    () => uniq(matchingAssets?.map(({ symbol }) => symbol)).slice(0, 3),
    [matchingAssets],
  )
  const matchingAssetsValue = useMemo(
    () => matchingAssets?.reduce((acc, token) => acc + token.balanceUSD, 0),
    [matchingAssets],
  )
  if (!assets) {
    return {
      matchingAssets: undefined,
      matchingTopAssets: undefined,
      matchingAssetsValue: undefined,
    }
  }
  return { matchingAssets, matchingTopAssets, matchingAssetsValue }
}
