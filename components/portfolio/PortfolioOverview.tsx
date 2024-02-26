import BigNumber from 'bignumber.js'
import { AppLink } from 'components/Links'
import { PortfolioOverviewItem } from 'components/portfolio/PortfolioOverviewItem'
import { Tag } from 'components/Tag'
import { WithArrow } from 'components/WithArrow'
import { getMigrationLink } from 'features/migrations/getMigrationLink'
import type { PortfolioPosition } from 'handlers/portfolio/types'
import { getLocalAppConfig } from 'helpers/config'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import { isTouchDevice } from 'helpers/isTouchDevice'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useOnMobile } from 'theme/useBreakpointIndex'
import { Flex, Heading } from 'theme-ui'

import type { PortfolioAssetsResponse, PortfolioOverviewResponse } from './types/domain-types'

export const PortfolioOverview = ({
  address,
  overviewData,
  portfolioWalletData,
  migrationPositions,
}: {
  address: string
  overviewData: PortfolioOverviewResponse
  portfolioWalletData: PortfolioAssetsResponse
  migrationPositions?: PortfolioPosition[]
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const isMobile = useOnMobile() && isTouchDevice

  const totalValue = overviewData.allAssetsUsdValue + portfolioWalletData.totalAssetsUsdValue
  const availableToMigrateUsdValue =
    migrationPositions == null
      ? 0
      : migrationPositions.reduce((acc, position) => acc + position.netValue, 0)
  const biggestMigration = migrationPositions && migrationPositions[0]

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
            <Heading variant="header4">${formatCryptoBalance(new BigNumber(totalValue))}</Heading>
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
            <Heading variant="header4" sx={getGradientColor(summerBrandGradient)}>
              ${formatCryptoBalance(new BigNumber(overviewData.summerUsdValue))}
            </Heading>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio(isMobile ? 'total-supplied-mobile' : 'total-supplied')}
          value={
            <Heading variant="header4">
              ${formatCryptoBalance(new BigNumber(overviewData.suppliedUsdValue))}
            </Heading>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio(isMobile ? 'total-borrowed-mobile' : 'total-borrowed')}
          value={
            <Heading variant="header4">
              ${formatCryptoBalance(new BigNumber(overviewData.borrowedUsdValue))}
            </Heading>
          }
        />
        <PortfolioOverviewItem
          header={tPortfolio('available-to-migrate')}
          value={
            getLocalAppConfig('features').EnableMigrations ? (
              <Heading variant="header4">
                ${formatCryptoBalance(new BigNumber(availableToMigrateUsdValue))}
              </Heading>
            ) : (
              <Tag sx={{ mt: 2 }} variant="tagInteractive">
                {tPortfolio('coming-soon')}
              </Tag>
            )
          }
          subValue={
            getLocalAppConfig('features').EnableMigrations && (
              <AppLink
                href={
                  biggestMigration
                    ? getMigrationLink({
                        protocol: biggestMigration.protocol,
                        network: biggestMigration.network,
                        address,
                      })
                    : ''
                }
                target="_self"
                sx={{ mr: 3 }}
              >
                <WithArrow sx={{ color: 'interactive100' }}>{tPortfolio('migrate')}</WithArrow>
              </AppLink>
            )
          }
        />
      </Flex>
    </Flex>
  )
}
