import type { PortfolioPositionsReply } from 'handlers/portfolio/types'
import { useCallback, useMemo } from 'react'

import {
  ChainId,
  type PortfolioAssetsResponse,
  type PortfolioMigrationsResponse,
  type PortfolioOverviewResponse,
  ProtocolId,
} from 'lambdas/lib/shared/src/domain-types'

/**
 * typed client for fetching portfolio data from aws gateway
 * @param baseUrl
 * @param headers
 * @returns getters for portfolio data
 */
export const usePortfolioClient = (baseUrl?: string, headers?: HeadersInit) => {
  const fetchPortfolioGeneric = useCallback(
    async <ResponseType>(
      section: 'overview' | 'assets' | 'positions' | 'positionsCount',
      address: string,
    ): Promise<ResponseType> => {
      let callUrl
      switch (section) {
        case 'positions':
          callUrl = `/api/positions/${address}`
          break
        case 'overview':
        case 'assets':
          callUrl = `${baseUrl}/portfolio-${section}?address=${address}`
          break
        default:
          throw new Error('Invalid usePortfolioClient section')
      }
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
        fetchPortfolioGeneric<PortfolioPositionsReply>('positions', address),
      fetchPortfolioMigrations: (address: string): Promise<PortfolioMigrationsResponse> => {
        address
        return Promise.resolve({
          migrations: [
            {
              chainId: ChainId.MAINNET,
              protocolId: ProtocolId.AAVE3,
              collateralAsset: {
                symbol: 'WBTC',
                balance: 150000001n,
                balanceDecimals: 8n,
                price: 6000000000000n,
                priceDecimals: 8n,
                usdValue: 90000.0006,
              },
              debtAsset: {
                symbol: 'USDC',
                balance: 55008759919n,
                balanceDecimals: 6n,
                price: 100000000n,
                priceDecimals: 8n,
                usdValue: 55008.759919,
              },
            },
          ],
        })
      },
    }),
    [fetchPortfolioGeneric],
  )
}
