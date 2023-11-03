import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { getPortfolioChangeColor, getPortfolioChangeSign } from 'components/portfolio/helpers'
import { PortfolioOverviewItem } from 'components/portfolio/PortfolioOverviewItem'
import { Tag } from 'components/Tag'
import { WithArrow } from 'components/WithArrow'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Heading, Text } from 'theme-ui'

import type { PortfolioOverviewResponse } from 'lambdas/src/portfolio-overview/types'

export const PortfolioOverview = ({
  address,
  overviewData,
}: {
  address: string
  overviewData?: PortfolioOverviewResponse | void
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  if (!overviewData) {
    return <>'Loading'</>
  }

  return (
    <Flex
      sx={{
        flexDirection: ['column', 'row'],
        justifyContent: ['flex-start', 'space-between'],
        mb: 4,
      }}
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
            <AppLink href={`/portfolio/${address}`} hash="wallet">
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
          header={tPortfolio('total-portfiolio')}
          value={
            <Heading
              variant="header4"
              sx={{
                backgroundImage: 'linear-gradient(90deg, #007DA3 0%, #E7A77F 50%, #E97047 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ${formatAmount(new BigNumber(overviewData.totalUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getPortfolioChangeColor(overviewData.totalPercentageChange) }}
            >
              {getPortfolioChangeSign(overviewData.totalPercentageChange)}
              {tPortfolio('past-week', { percentage: overviewData.totalPercentageChange })}
            </Text>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio('total-supplied')}
          value={
            <Heading variant="header4">
              ${formatAmount(new BigNumber(overviewData.suppliedUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getPortfolioChangeColor(overviewData.suppliedPercentageChange) }}
            >
              {getPortfolioChangeSign(overviewData.suppliedPercentageChange)}
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
              sx={{ color: getPortfolioChangeColor(overviewData.borrowedPercentageChange) }}
            >
              {getPortfolioChangeSign(overviewData.borrowedPercentageChange)}
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
