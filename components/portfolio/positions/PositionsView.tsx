import type { PortfolioPositionsReply } from 'features/portfolio/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Box } from 'theme-ui'
import { useFetch } from 'usehooks-ts'

export const PositionsView = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { data: portfolioPositionsData = { positions: [] } } = useFetch<PortfolioPositionsReply>(
    `/api/portfolio/positions/${address}`,
  )
  return (
    <Box>
      <h4>{tPortfolio('positions-data')}</h4>
      <pre>{JSON.stringify(portfolioPositionsData, null, 2)}</pre>
    </Box>
  )
}
