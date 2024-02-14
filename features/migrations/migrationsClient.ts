import BigNumber from 'bignumber.js'
import { networksById } from 'blockchain/networks'
import { getMigrationLink } from 'features/migrations/getMigrationLink'
import {
  LendingProtocolByProtocolId,
  type PortfolioMigrationsResponse,
} from 'features/migrations/types'
import type { DetailsTypeCommon, PortfolioPosition } from 'handlers/portfolio/types'
import { formatAsShorthandNumbers } from 'helpers/formatters/format'
import { useCallback, useMemo } from 'react'

export const getPortfolioMigrationsResponse = async (
  address: string,
  customRpcUrl?: string,
): Promise<PortfolioMigrationsResponse | undefined> => {
  const rpcQuery = customRpcUrl ? `&customRpcUrl=${encodeURI(customRpcUrl)}` : ''
  const callUrl = `/api/migrations?address=${address}${rpcQuery}`
  return await fetch(callUrl, {
    headers: [],
  })
    .then((res) => res.json())
    .catch((err) => {
      console.error(err)
      return undefined
    })
}

export const fetchMigrations = async (
  address: string,
): Promise<PortfolioPosition[] | undefined> => {
  return getPortfolioMigrationsResponse(address)
    .then((res: PortfolioMigrationsResponse | undefined) =>
      res?.migrations
        .map((migration, index): PortfolioPosition => {
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
            url: getMigrationLink({
              protocolId: migration.protocolId,
              chainId: migration.chainId,
              address,
            }),
            automations: {},
            netValue,
          }
          return position
        })
        // sort by net value
        .sort((a, b) => b.netValue - a.netValue),
    )
    .catch((err) => {
      console.error(err)
      return undefined
    })
}

/**
 * typed client encapsulating fetching data from aws infra
 * @returns getters for data
 */
export const useMigrationsClient = () => {
  const _fetchMigrations = useCallback(
    async (address: string): Promise<PortfolioPosition[] | undefined> => {
      return await fetchMigrations(address)
    },
    [],
  )

  return useMemo(
    () => ({
      fetchMigrationPositions: (address: string) => _fetchMigrations(address),
    }),
    [_fetchMigrations],
  )
}
