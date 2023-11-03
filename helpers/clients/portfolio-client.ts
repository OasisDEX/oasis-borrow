import { useCallback, useMemo } from 'react'

import type { PortfolioAssetsReply } from 'lambdas/src/portfolio-assets/types'
import type { PortfolioOverviewResponse } from 'lambdas/src/portfolio-overview/types'
import type { PortfolioPositionsReply } from 'lambdas/src/portfolio-positions/types'

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
      const response = await fetch(`${baseUrl}/portfolio-${section}?address=${address}`, {
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
        fetchPortfolioGeneric<PortfolioAssetsReply>('assets', address),
      fetchPortfolioPositions: (address: string) =>
        fetchPortfolioGeneric<PortfolioPositionsReply>('positions', address),
    }),
    [fetchPortfolioGeneric],
  )
}
