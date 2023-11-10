import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { getMakerPositionInfo } from 'handlers/portfolio/positions/handlers/maker/helpers'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const makerPositionsHandler: PortfolioPositionsHandler = async ({ apiVaults, address }) => {
  const subgraphPositions = (await loadSubgraph(
    'Discover',
    'getMakerDiscoverPositions',
    NetworkIds.MAINNET,
    {
      walletAddress: address,
    },
  )) as SubgraphsResponses['Discover']['getMakerDiscoverPositions']

  const positions = await Promise.all(
    subgraphPositions.response.cdps.map(
      async ({ cdp, collateral, debt, type: initialType }): Promise<PortfolioPosition> => {
        const { type, url } = await getMakerPositionInfo({ apiVaults, cdp, type: initialType })

        return {
          availableToMigrate: false,
          automations: {},
          details: [],
          ...(type === OmniProductType.Earn && { lendingType: 'passive' }),
          network: NetworkNames.ethereumMainnet,
          netValue: 0,
          openDate: 0,
          positionId: Number(cdp),
          primaryToken: '',
          protocol: LendingProtocol.Maker,
          secondaryToken: 'DAI',
          type,
          url,
        }
      },
    ),
  )

  return {
    positions,
    address,
  }
}
