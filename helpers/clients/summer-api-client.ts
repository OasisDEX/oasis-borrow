import { useMemo } from 'react'

import {
  ChainId,
  type PortfolioMigrationsResponse,
  ProtocolId,
} from 'lambdas/lib/shared/src/domain-types'

/**
 * typed client for fetching summer api data from aws gateway
 * @param baseUrl
 * @param headers
 * @returns getters for summer api data
 */
export const useSummerApiClient = (/**baseUrl?: string, headers?: HeadersInit*/) => {
  return useMemo(
    () => ({
      fetchMigrations: (address: string): Promise<PortfolioMigrationsResponse> => {
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
    [],
  )
}
