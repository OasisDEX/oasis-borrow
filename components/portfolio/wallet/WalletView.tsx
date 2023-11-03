import type { PortfolioAssetsReply } from 'features/portfolio/types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'

export const WalletView = ({
  address,
  fetchData,
}: {
  address: string
  fetchData: (address: string) => Promise<PortfolioAssetsReply>
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  // fetch data
  const [portfolioWalletData, setPortfolioWalletData] = useState<PortfolioAssetsReply>()
  useEffect(() => {
    void fetchData(address).then((data) => {
      setPortfolioWalletData(data)
    })
  }, [address, fetchData])
  return (
    <Box>
      <h4>{tPortfolio('wallet-data')}</h4>
      <pre>{JSON.stringify(portfolioWalletData, null, 2)}</pre>
    </Box>
  )
}
