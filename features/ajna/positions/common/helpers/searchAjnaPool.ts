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

  let pools = response?.pools || []

  if (poolAddress)
    pools = pools.filter((pool) => pool.address.toLowerCase() === poolAddress.toLowerCase())
  if (collateralAddress)
    pools = pools.filter(
      (pool) => pool.collateralAddress.toLowerCase() === collateralAddress.toLowerCase(),
    )
  if (quoteAddress)
    pools = pools.filter(
      (pool) => pool.quoteTokenAddress.toLowerCase() === quoteAddress.toLowerCase(),
    )

  return {
    pools,
    size: response?.pools?.length || 0,
  }
}
