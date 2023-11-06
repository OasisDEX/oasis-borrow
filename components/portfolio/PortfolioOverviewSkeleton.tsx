import { AppLink } from 'components/Links'
import { Skeleton } from 'components/Skeleton'
import { Tag } from 'components/Tag'
import { WithArrow } from 'components/WithArrow'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Flex } from 'theme-ui'

import { PortfolioOverviewItem } from './PortfolioOverviewItem'

export const PortfolioOverviewSkeleton = ({ address }: { address: string }) => {
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
          value={<Skeleton sx={{ height: 4, mt: 2 }} />}
          subValue={
            <AppLink href={`/portfolio/${address}`} hash="wallet">
              <WithArrow sx={{ color: 'interactive100' }}>{tPortfolio('view-assets')}</WithArrow>
            </AppLink>
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
          header={tPortfolio('total-supplied')}
          value={
            <Skeleton
              sx={{
                mt: 2,
                height: 4,
              }}
              color="fancy"
            />
          }
          subValue={<Skeleton sx={{ mt: 2 }} />}
        />
        <PortfolioOverviewItem
          header={tPortfolio('total-borrowed')}
          value={<Skeleton sx={{ mt: 2, height: 4 }} />}
          subValue={<Skeleton sx={{ mt: 2 }} />}
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
