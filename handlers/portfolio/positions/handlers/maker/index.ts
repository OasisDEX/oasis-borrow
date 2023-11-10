import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { getTokenPrice } from 'blockchain/prices'
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
        ilk: {
          liquidationRatio,
          pip: { value },
          tokenSymbol,
        },
        liquidationPrice,
        openedAt,
        type: initialType,
      }): Promise<PortfolioPosition> => {
        const { primaryToken, type, url } = await getMakerPositionInfo({
          apiVaults,
          cdp,
          tokenSymbol,
          type: initialType,
        })
        const daiPrice = getTokenPrice('DAI', tickers)
        const collateralPrice = new BigNumber(value)
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
            liquidationRatio,
            primaryToken,
            type,
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
