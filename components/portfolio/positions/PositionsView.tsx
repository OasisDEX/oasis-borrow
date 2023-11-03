import type { PortfolioPositionsReply } from 'features/portfolio/types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'

export const PositionsView = ({
  address,
  fetchData,
}: {
  address: string
  fetchData: (address: string) => Promise<PortfolioPositionsReply>
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  // fetch data
  const [portfolioPositionsData, setPortfolioPositionsData] = useState<PortfolioPositionsReply>()
  useEffect(() => {
    void fetchData(address).then((data) => {
      setPortfolioPositionsData(data)
    })
  }, [address, fetchData])
  return (
    <Box>
      <h4>{tPortfolio('positions-data')}</h4>
      <pre>{JSON.stringify(portfolioPositionsData, null, 2)}</pre>
    </Box>
  )
}
