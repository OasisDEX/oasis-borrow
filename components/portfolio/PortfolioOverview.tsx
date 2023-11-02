import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { Tag } from 'components/Tag'
import { WithArrow } from 'components/WithArrow'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Heading, Text } from 'theme-ui'

import { PortfolioOverviewItem } from './PortfolioOverviewItem'
import type { PortfolioOverviewResponse } from 'lambdas/src/portfolio-overview/types'

function getChangeColor(change: number): string {
  if (change > 0) {
    return 'success100'
  }
  if (change < 0) {
    return 'critical100'
  }
  return 'neutral80'
}
function getChangeSign(change: number): string {
  if (change > 0) {
    return '+'
  }
  // negative values have minuses already
  return ''
}

export const PortfolioOverview = ({
  overviewData,
}: {
  overviewData?: PortfolioOverviewResponse
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  if (!overviewData) {
    return <>'Loading'</>
  }

  return (
    <Flex
      sx={{ flexDirection: ['column', 'row'], justifyContent: ['flex-start', 'space-between'] }}
    >
      <Flex sx={{ alignItems: 'flex-start' }}>
        <PortfolioOverviewItem
          header={tPortfolio('wallet-balance')}
          value={
            <Heading variant="header4">
              ${formatAmount(new BigNumber(overviewData.walletBalanceUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <AppLink href="/portfolio/wallet">
              <WithArrow sx={{ color: 'interactive100' }}>{tPortfolio('view-assets')}</WithArrow>
            </AppLink>
          }
          firstInColumn
        />
      </Flex>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: 'flex-start',
          justifyItems: 'flex-start',
        }}
      >
        <PortfolioOverviewItem
          header={tPortfolio('total-supplied')}
          value={
            <Heading
              variant="header4"
              sx={{
                backgroundImage: 'linear-gradient(90deg, #007DA3 0%, #E7A77F 50%, #E97047 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ${formatAmount(new BigNumber(overviewData.suppliedUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getChangeColor(overviewData.suppliedPercentageChange) }}
            >
              {getChangeSign(overviewData.suppliedPercentageChange)}
              {tPortfolio('past-week', { percentage: overviewData.suppliedPercentageChange })}
            </Text>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio('total-borrowed')}
          value={
            <Heading variant="header4">
              ${formatAmount(new BigNumber(overviewData.borrowedUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getChangeColor(overviewData.borrowedPercentageChange) }}
            >
              {getChangeSign(overviewData.borrowedPercentageChange)}
              {tPortfolio('past-week', { percentage: overviewData.borrowedPercentageChange })}
            </Text>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio('available-to-migrate')}
          value={
            <Tag sx={{ mt: 2 }} variant="tagInteractive">
              {tPortfolio('coming-soon')}
            </Tag>
          }
        />
      </Flex>
    </Flex>
  )
}
