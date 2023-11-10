import { NetworkIds } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { PortfolioPositionsHandler } from 'handlers/portfolio/types'

export const makerPositionsHandler: PortfolioPositionsHandler = async ({ address }) => {
  const subgraphPositions = (await loadSubgraph(
    'Discover',
    'getMakerDiscoverPositions',
    NetworkIds.MAINNET,
    {
      walletAddress: address,
    },
  )) as SubgraphsResponses['Discover']['getMakerDiscoverPositions']

  console.log(subgraphPositions)

  return {
    positions: [],
    address,
  }
}
