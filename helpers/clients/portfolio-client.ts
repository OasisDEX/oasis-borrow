import type {
  PortfolioAssetsResponse,
  PortfolioOverviewResponse,
} from 'components/portfolio/types/domain-types'
import type { PortfolioPositionsReply } from 'handlers/portfolio/types'
import { getLocalAppConfig } from 'helpers/config'
import { useCallback, useMemo } from 'react'

/**
 * typed client for fetching portfolio data from aws gateway
 * @param baseUrl
 * @param headers
 * @returns getters for portfolio data
 */
export const usePortfolioClient = (baseUrl?: string, headers?: HeadersInit) => {
  const { UseOmniKitLinks } = getLocalAppConfig('features')
  const fetchPortfolioGeneric = useCallback(
    async <ResponseType>(
      section: 'overview' | 'assets' | 'positions' | 'positionsCount',
      address: string,
    ): Promise<ResponseType> => {
      let callUrl
      switch (section) {
        case 'positions':
          callUrl = UseOmniKitLinks
            ? `/api/positions/${address}?useOmniKitLinks`
            : `/api/positions/${address}`
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
    [baseUrl, headers, UseOmniKitLinks],
  )

  return useMemo(
    () => ({
      fetchPortfolioOverview: (address: string) =>
        fetchPortfolioGeneric<PortfolioOverviewResponse>('overview', address),
      fetchPortfolioAssets: (address: string) =>
        fetchPortfolioGeneric<PortfolioAssetsResponse>('assets', address),
      fetchPortfolioPositions: (address: string) =>
        fetchPortfolioGeneric<PortfolioPositionsReply>('positions', address),
    }),
    [fetchPortfolioGeneric],
  )
}
