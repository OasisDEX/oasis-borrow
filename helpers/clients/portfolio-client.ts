import type {
  PortfolioPositionsCountReply,
  PortfolioPositionsReply,
} from 'handlers/portfolio/types'
import { useCallback, useMemo } from 'react'

import type {
  PortfolioAssetsResponse,
  PortfolioOverviewResponse,
} from 'lambdas/src/shared/domain-types'

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
        case 'positionsCount':
          callUrl = `/api/positions/${address}?positionsCount`
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
      fetchPortfolioPositionsCount: (address: string) =>
        fetchPortfolioGeneric<PortfolioPositionsCountReply>('positionsCount', address),
    }),
    [fetchPortfolioGeneric],
  )
}
