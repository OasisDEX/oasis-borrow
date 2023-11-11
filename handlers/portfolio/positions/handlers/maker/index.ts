import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraph } from 'features/subgraphLoader/useSubgraphLoader'
import { getMakerPositionInfo } from 'handlers/portfolio/positions/handlers/maker/helpers'
import { getMakerPositionDetails } from 'handlers/portfolio/positions/handlers/maker/helpers/getMakerPositionDetails'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const makerPositionsHandler: PortfolioPositionsHandler = async ({
  apiVaults,
  address,
  tickers,
}) => {
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
      async ({
        cdp,
        collateral,
        debt,
        ilk,
        liquidationPrice,
        openedAt,
        type: initialType,
      }): Promise<PortfolioPosition> => {
        const { collateralPrice, daiPrice, primaryToken, type, url } = await getMakerPositionInfo({
          apiVaults,
          cdp,
          ilk,
          tickers,
          type: initialType,
        })

        const netValue = new BigNumber(collateral)
          .times(collateralPrice)
          .minus(new BigNumber(debt).times(daiPrice))

        return {
          availableToMigrate: false,
          automations: {
            autoBuy: { enabled: false },
            autoSell: { enabled: false },
            stopLoss: { enabled: false },
            takeProfit: { enabled: false },
          },
          details: getMakerPositionDetails({
            collateral,
            collateralPrice,
            daiPrice,
            debt,
            liquidationPrice,
            primaryToken,
            type,
            ilk,
          }),
          ...(type === OmniProductType.Earn && { lendingType: 'passive' }),
          network: NetworkNames.ethereumMainnet,
          netValue: netValue.toNumber(),
          openDate: Number(openedAt),
          positionId: Number(cdp),
          primaryToken,
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
