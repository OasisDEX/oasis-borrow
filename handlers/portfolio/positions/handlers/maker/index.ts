import { NetworkIds, NetworkNames } from 'blockchain/networks'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const makerPositionsHandler: PortfolioPositionsHandler = async ({ address }) => {
  const subgraphPositions = (await loadSubgraph(
    'Discover',
    'getMakerDiscoverPositions',
    NetworkIds.MAINNET,
    {
      walletAddress: address,
    },
  )) as SubgraphsResponses['Discover']['getMakerDiscoverPositions']

  const positions = await Promise.all(
    subgraphPositions.response.cdps.map(async ({}): Promise<PortfolioPosition> => {
      return {
        availableToMigrate: false,
        // automations: {},
        // details
        // ...(isEarn && { lendingType: 'active' }),
        network: NetworkNames.ethereumMainnet,
        // netValue
        // openDate
        // positionId
        // primaryToken,
        protocol: LendingProtocol.Maker,
        // secondaryToken,
        // type,
        // url,
      }
    }),
  )

  return {
    positions,
    address,
  }
}
