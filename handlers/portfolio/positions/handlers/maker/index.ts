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
        cumulativeDepositUSD,
        cumulativeFeesUSD,
        cumulativeWithdrawnUSD,
        ilk,
        liquidationPrice,
        normalizedDebt,
        openedAt,
        type: initialType,
      }): Promise<PortfolioPosition> => {
        const { collateralPrice, daiPrice, debt, primaryToken, secondaryToken, type, url } =
          await getMakerPositionInfo({
            apiVaults,
            cdp,
            ilk,
            normalizedDebt,
            tickers,
            type: initialType,
          })

        const netValue = new BigNumber(collateral)
          .times(collateralPrice)
          .minus(debt.times(daiPrice))

        return {
          availableToMigrate: false,
          automations: {
            ...(type !== OmniProductType.Earn && {
              autoBuy: { enabled: false },
              autoSell: { enabled: false },
              stopLoss: { enabled: false },
              takeProfit: { enabled: false },
            }),
          },
          details: getMakerPositionDetails({
            collateral,
            collateralPrice,
            cumulativeDepositUSD,
            cumulativeFeesUSD,
            cumulativeWithdrawnUSD,
            daiPrice,
            debt,
            ilk,
            liquidationPrice,
            netValue,
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
          secondaryToken,
          type,
          url,
        }
      },
    ),
  )

  return {
    address,
    positions,
  }
}
