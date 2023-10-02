import type { PortfolioBalanceResponse, ProtocolAsset } from 'pages/api/portfolio-balance/types'
import { useEffect, useState } from 'react'

export type PortfolioBalanceApi = {
  walletAssetsUsdValue: number
  protocolAssetsUsdValue: number
  totalAssetsUsdValue: number
  protocolAssets: ProtocolAsset[]
}

export function usePortfolioBalanceApi(
  address: string,
): [PortfolioBalanceApi | undefined, string | undefined] {
  const [response, setResponse] = useState<PortfolioBalanceApi>()
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/portfolio-balance?address=${address}`)
        const json: PortfolioBalanceResponse = await res.json()
        setResponse(json)
      } catch (error) {
        setErrorMessage((error as Error)?.message || 'Unknown error')
      }
    }

    void fetchData()
  }, [address])

  return [response, errorMessage]
}
