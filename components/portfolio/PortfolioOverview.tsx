import BigNumber from 'bignumber.js'
import { PortfolioOverviewItem } from 'components/portfolio/PortfolioOverviewItem'
import { Tag } from 'components/Tag'
import { formatAmount } from 'helpers/formatters/format'
import { isTouchDevice } from 'helpers/isTouchDevice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Heading } from 'theme-ui'

import type {
  PortfolioAssetsResponse,
  PortfolioOverviewResponse,
} from 'lambdas/src/shared/domain-types'

export const PortfolioOverview = ({
  overviewData,
  portfolioWalletData,
}: {
  overviewData: PortfolioOverviewResponse
  portfolioWalletData: PortfolioAssetsResponse
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const isMobile = useOnMobile() && isTouchDevice

  const totalValue = overviewData.summerUsdValue + portfolioWalletData.totalAssetsUsdValue

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
        />
      </Flex>
      <Flex
        sx={{
          flexDirection: ['column', 'row'],
          alignItems: 'flex-start',
          justifyItems: 'flex-start',
          columnGap: '24px',
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
        />
        <PortfolioOverviewItem
          header={tPortfolio(isMobile ? 'total-supplied-mobile' : 'total-supplied')}
          value={
            <Heading variant="header4">
              ${formatAmount(new BigNumber(overviewData.suppliedUsdValue), 'USD')}
            </Heading>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio(isMobile ? 'total-borrowed-mobile' : 'total-borrowed')}
          value={
            <Heading variant="header4">
              ${formatAmount(new BigNumber(overviewData.borrowedUsdValue), 'USD')}
            </Heading>
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
