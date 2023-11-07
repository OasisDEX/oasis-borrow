import { Skeleton } from 'components/Skeleton'
import { Tag } from 'components/Tag'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'theme-ui'

import { PortfolioOverviewItem } from './PortfolioOverviewItem'

export const PortfolioOverviewSkeleton = () => {
  const { t: tPortfolio } = useTranslation('portfolio')
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
          value={<Skeleton sx={{ width: '200px', height: '28px', mt: 2 }} />}
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
          value={<Skeleton sx={{ width: '120px', height: '28px', mt: 2 }} color="fancy" />}
        />
        <PortfolioOverviewItem
          header={tPortfolio('total-supplied')}
          value={<Skeleton sx={{ width: '120px', height: '28px', mt: 2 }} />}
        />
        <PortfolioOverviewItem
          header={tPortfolio('total-borrowed')}
          value={<Skeleton sx={{ width: '120px', height: '28px', mt: 2 }} />}
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
