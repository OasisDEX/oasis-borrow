import { useEffect, useState } from 'react'

type ProtocolAsset = {
  id: string
  chain: string
  name: string
  site_url: string
  logo_url: string
  has_supported_portfolio: boolean
  tvl: number
  net_usd_value: number
  asset_usd_value: number
  debt_usd_value: number
}

type PortfolioBalance = {
  protocolAssets: ProtocolAsset[]
  walletAssets: {
    usd_value: number
  }
}

export type PortfolioBalanceResponse = {
  walletAssetsUsdValue: number
  protocolAssetsUsdValue: number
  totalAssetsUsdValue: number
  sortedProtocolAssets: ProtocolAsset[]
}

export function usePortfolioBalanceApi(
  address: string,
): [PortfolioBalanceResponse | undefined, string | undefined] {
  const [response, setResponse] = useState<PortfolioBalanceResponse>()
  const [errorMessage, setErrorMessage] = useState<string>()

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/portfolio-balance/${address}`)
        const data: PortfolioBalance = await res.json()

        const { protocolAssets, walletAssets } = data

        const walletAssetsUsdValue = walletAssets.usd_value
        const protocolAssetsUsdValue = protocolAssets.reduce(
          (acc, { net_usd_value }) => acc + net_usd_value,
          0,
        )
        const totalAssetsUsdValue = walletAssetsUsdValue + protocolAssetsUsdValue

        const sortedProtocolAssets = protocolAssets
          .sort((a, b) => b.net_usd_value - a.net_usd_value)
          .slice(0, 5)

        setResponse({
          walletAssetsUsdValue,
          protocolAssetsUsdValue,
          totalAssetsUsdValue,
          sortedProtocolAssets,
        })
      } catch (error) {
        setErrorMessage((error as Error)?.message || 'Unknown error')
      }
    }

    void fetchData()
  }, [address])

  return [response, errorMessage]
}
