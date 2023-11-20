import type { PortfolioPositionsResponse } from 'handlers/portfolio/types'
import { useCallback, useMemo } from 'react'

import type {
  PortfolioAssetsResponse,
  PortfolioMigrationsResponse,
  PortfolioOverviewResponse,
} from 'lambdas/lib/shared/src/domain-types'

/**
 * typed client for fetching portfolio data from aws gateway
 * @param baseUrl
 * @param headers
 * @returns getters for portfolio data
 */
export const usePortfolioClient = (baseUrl: string, headers: HeadersInit) => {
  const fetchPortfolioGeneric = useCallback(
    async <ResponseType>(
      section: 'overview' | 'assets' | 'positions',
      address: string,
    ): Promise<ResponseType> => {
      const callUrl =
        section === 'positions'
          ? `/api/positions/${address}`
          : `${baseUrl}/portfolio-${section}?address=${address}`
      const response = await fetch(callUrl, {
        headers,
      })
        .then((res) => res.json())
        .catch((err) => console.error(err))
      return response
    },
    [baseUrl, headers],
  )

  return useMemo(
    () => ({
      fetchPortfolioOverview: (address: string) =>
        fetchPortfolioGeneric<PortfolioOverviewResponse>('overview', address),
      fetchPortfolioAssets: (address: string) =>
        fetchPortfolioGeneric<PortfolioAssetsResponse>('assets', address),
      fetchPortfolioPositions: (address: string) =>
        fetchPortfolioGeneric<PortfolioPositionsResponse>('positions', address),
      fetchPortfolioMigrations: (address: string): Promise<PortfolioMigrationsResponse> => {
        address
        return Promise.resolve({
          migrations: [
            {
              chainId: '',
              protocolId: 'aave3',
              collateralAsset: {
                balance: 100000000n,
                balanceDecimals: 8n,
                price: 100000000n,
                priceDecimals: 8n,
                symbol: 'WBTC',
                usdValue: 90000n,
              },
              debtAsset: {
                balance: 100000000n,
                balanceDecimals: 8n,
                price: 100000000n,
                priceDecimals: 8n,
                symbol: 'WBTC',
                usdValue: 90000n,
              },
            },
          ],
        })
      },
    }),
    [fetchPortfolioGeneric],
  )
}
