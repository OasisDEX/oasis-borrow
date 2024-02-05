import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/networks'
import {
  LendingProtocolByProtocolId,
  type PortfolioMigrationsResponse,
} from 'features/migrations/types'
import type { DetailsTypeCommon, PortfolioPosition } from 'handlers/portfolio/types'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useCallback, useMemo } from 'react'

/**
 * typed client encapsulating fetching data from aws infra
 * @returns getters for data
 */
export const useMigrationsClient = () => {
  const fetchMigrations = useCallback(
    async (address: string): Promise<PortfolioPosition[] | undefined> => {
      const callUrl = `/api/migrations?address=${address}`
      const response = await fetch(callUrl, {
        headers: [],
      })
        .then((res) => res.json())
        .then((res: PortfolioMigrationsResponse) =>
          res?.migrations.map((migration, index): PortfolioPosition => {
            const primaryToken =
              migration.collateralAsset.symbol === 'WETH' ? 'ETH' : migration.collateralAsset.symbol
            const secondaryToken =
              migration.debtAsset.symbol === 'WETH' ? 'ETH' : migration.debtAsset.symbol
            const collateralAmount = formatAsShorthandNumbers(
              new BigNumber(migration.collateralAsset.balance).dividedBy(
                new BigNumber(10).pow(migration.collateralAsset.balanceDecimals),
              ),
              4,
            )
            const debtAmount = formatAsShorthandNumbers(
              new BigNumber(migration.debtAsset.balance).dividedBy(
                new BigNumber(10).pow(migration.debtAsset.balanceDecimals),
              ),
              4,
            )
            // Collateral - debt
            const netValue = migration.collateralAsset.usdValue - migration.debtAsset.usdValue
            const position = {
              positionId: index,
              protocol: LendingProtocolByProtocolId[migration.protocolId],
              network: networksById[migration.chainId].name,
              primaryToken,
              secondaryToken,
              availableToMigrate: true,
              details: [
                { type: 'suppliedToken' as DetailsTypeCommon, value: primaryToken },
                {
                  type: 'suppliedTokenBalance' as DetailsTypeCommon,
                  value: collateralAmount.toString(),
                  symbol: primaryToken,
                },
                { type: 'borrowedToken' as DetailsTypeCommon, value: secondaryToken },
                {
                  type: 'borrowedTokenBalance' as DetailsTypeCommon,
                  value: debtAmount.toString(),
                  symbol: secondaryToken,
                },
              ],
              type: undefined,
              url: 'TODO migration link',
              automations: {},
              netValue,
            }
            return position
          }),
        )
        .catch((err) => {
          console.error(err)
          return undefined
        })

      return response
    },
    [],
  )

  return useMemo(
    () => ({
      fetchMigrationPositions: (address: string) => fetchMigrations(address),
    }),
    [fetchMigrations],
  )
}
