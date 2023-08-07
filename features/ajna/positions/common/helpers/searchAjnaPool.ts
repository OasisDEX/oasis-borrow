import { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

interface SearchAjnaPoolParams {
  collateralAddress?: string
  poolAddress?: string
  quoteAddress?: string
}

export const searchAjnaPool = async ({
  collateralAddress,
  poolAddress,
  quoteAddress,
}: SearchAjnaPoolParams) => {
  const { response } = (await loadSubgraph('Ajna', 'searchAjnaPool', {
    collateralAddress: collateralAddress?.toLowerCase() || '',
    poolAddress: poolAddress?.toLowerCase() || '',
    quoteAddress: quoteAddress?.toLowerCase() || '',
  })) as SubgraphsResponses['Ajna']['searchAjnaPool']

  return {
    pools:
      response && response.pools
        ? poolAddress
          ? response.pools.filter(
              (pool) => pool.address.toLowerCase() === poolAddress.toLowerCase(),
            )
          : collateralAddress && quoteAddress
          ? response.pools.filter(
              (pool) =>
                pool.collateralAddress.toLowerCase() === collateralAddress.toLowerCase() &&
                pool.quoteTokenAddress.toLowerCase() === quoteAddress.toLowerCase(),
            )
          : response.pools
        : [],
    size: response?.pools?.length || 0,
  }
}
