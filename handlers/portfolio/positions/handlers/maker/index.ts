import BigNumber from 'bignumber.js'
import { NetworkIds, NetworkNames } from 'blockchain/networks'
import { OmniProductType } from 'features/omni-kit/types'
import type { SubgraphsResponses } from 'features/subgraphLoader/types'
import { loadSubgraphBackend } from 'features/subgraphLoader/useSubgraphLoaderBackend'
import {
  getMakerPositionDetails,
  getMakerPositionInfo,
} from 'handlers/portfolio/positions/handlers/maker/helpers'
import { getPositionsAutomations } from 'handlers/portfolio/positions/helpers'
import type { PortfolioPosition, PortfolioPositionsHandler } from 'handlers/portfolio/types'
import { LendingProtocol } from 'lendingProtocols'

export const makerPositionsHandler: PortfolioPositionsHandler = async ({
  apiVaults,
  address,
  prices,
}) => {
  const subgraphPositions = (await loadSubgraphBackend(
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
        triggers,
        type: initialType,
      }): Promise<PortfolioPosition> => {
        const { collateralPrice, daiPrice, debt, primaryToken, secondaryToken, type, url } =
          await getMakerPositionInfo({
            apiVaults,
            cdp,
            ilk,
            normalizedDebt,
            prices,
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
              ...getPositionsAutomations({ networkId: NetworkIds.MAINNET, triggers }),
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
