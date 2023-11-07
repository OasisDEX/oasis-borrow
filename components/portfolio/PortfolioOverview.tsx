import BigNumber from 'bignumber.js'
import { getPortfolioChangeColor, getPortfolioChangeSign } from 'components/portfolio/helpers'
import { PortfolioOverviewItem } from 'components/portfolio/PortfolioOverviewItem'
import { Tag } from 'components/Tag'
import { formatAmount } from 'helpers/formatters/format'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex, Heading, Text } from 'theme-ui'

import type {
  PortfolioAssetsResponse,
  PortfolioOverviewResponse,
} from 'lambdas/src/shared/domain-types'

export const PortfolioOverview = ({
  overviewData,
  portfolioWalletData,
}: {
  overviewData?: PortfolioOverviewResponse | void
  portfolioWalletData?: PortfolioAssetsResponse | void
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  if (!overviewData || !portfolioWalletData) {
    return <>'Loading'</>
  }

  const totalValue = overviewData.summerUsdValue + portfolioWalletData.totalAssetsUsdValue
  const totalPercentageChange =
    (overviewData.summerPercentageChange + portfolioWalletData.totalAssetsPercentageChange) / 2

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
          header={tPortfolio('total-value')}
          value={
            <Heading variant="header4">${formatAmount(new BigNumber(totalValue), 'USD')}</Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getPortfolioChangeColor(totalPercentageChange) }}
            >
              {getPortfolioChangeSign(totalPercentageChange)}
              {tPortfolio('past-week', { percentage: totalPercentageChange })}
            </Text>
          }
        />
      </Flex>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: 'flex-start',
          justifyItems: 'flex-start',
          columnGap: 4,
        }}
      >
        <PortfolioOverviewItem
          header={tPortfolio('total-portfolio')}
          value={
            <Heading
              variant="header4"
              sx={{
                backgroundImage: 'linear-gradient(90deg, #007DA3 0%, #E7A77F 50%, #E97047 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              ${formatAmount(new BigNumber(overviewData.summerUsdValue), 'USD')}
            </Heading>
          }
          subValue={
            <Text
              variant="paragraph4"
              sx={{ color: getPortfolioChangeColor(overviewData.summerPercentageChange) }}
            >
              {getPortfolioChangeSign(overviewData.summerPercentageChange)}
              {tPortfolio('past-week', { percentage: overviewData.summerPercentageChange })}
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
