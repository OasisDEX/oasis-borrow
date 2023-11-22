import type { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'

type GetAjnaPoolAddress = (
  collateralAddress: string,
  quoteAddress: string,
  networkId: NetworkIds,
) => Promise<string>

export const getAjnaPoolAddress: GetAjnaPoolAddress = async (
  collateralAddress,
  quoteAddress,
  networkId,
) => {
  const { response } = (await loadSubgraph('Ajna', 'getAjnaPoolAddress', networkId, {
    collateralAddress: collateralAddress.toLowerCase(),
    quoteAddress: quoteAddress.toLowerCase(),
  })) as SubgraphsResponses['Ajna']['getAjnaPoolAddress']

  if (response && response.pools.length) {
    const [pool] = response.pools

    return pool.address
  }

  throw new Error(
    `No pool data found for collateralAddress: ${collateralAddress} and quoteAddress: ${quoteAddress}, Response: ${JSON.stringify(
      response,
    )}`,
  )
}
