import { EmptyState } from 'components/EmptyState'
import type { GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { AppLink } from 'components/Links'
import { BlogPosts } from 'components/portfolio/blog-posts/BlogPosts'
import { PortfolioPositionBlock } from 'components/portfolio/positions/PortfolioPositionBlock'
import { PortfolioPositionBlockLoadingState } from 'components/portfolio/positions/PortfolioPositionBlockSkeleton'
import { PortfolioPositionFeatured } from 'components/portfolio/positions/PortfolioPositionFeatured'
import { PortfolioPositionLearn } from 'components/portfolio/positions/PortfolioPositionLearn'
import { PortfolioPositionsProductSelect } from 'components/portfolio/positions/PortfolioPositionsProductSelect'
import { PortfolioPositionsSortingSelect } from 'components/portfolio/positions/PortfolioPositionsSortingSelect'
import { PortfolioProductType, PortfolioSortingType } from 'components/portfolio/positions/types'
import type { PortfolioAssetsResponse } from 'components/portfolio/types/domain-types'
import { Toggle } from 'components/Toggle'
import { StatefulTooltip } from 'components/Tooltip'
import { WithArrow } from 'components/WithArrow'
import type { PortfolioPosition, PortfolioPositionsReply } from 'handlers/portfolio/types'
import { EXTERNAL_LINKS, INTERNAL_LINKS } from 'helpers/applicationLinks'
import { getLocalAppConfig } from 'helpers/config'
import { formatAddress } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { question_o, sparks } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

interface PortfolioPositionsViewProps {
  address: string
  blogPosts?: BlogPostsReply
  isOwner: boolean
  portfolioPositionsData?: PortfolioPositionsReply
  portfolioWalletData?: PortfolioAssetsResponse
  migrationPositions?: PortfolioPosition[]
}

type PortfolioPositionsViewFiltersType = {
  product?: PortfolioProductType[]
  showEmptyPositions: boolean
  sorting?: PortfolioSortingType
}

const filterEmptyPosition =
  (isFilterOn: boolean = false) =>
  ({ netValue }: PortfolioPosition) =>
    isFilterOn || netValue >= 0.01

export const PortfolioPositionsView = ({
  address,
  migrationPositions,
  blogPosts,
  isOwner,
  portfolioPositionsData,
  portfolioWalletData,
}: PortfolioPositionsViewProps) => {
  const { t: tPortfolio } = useTranslation('portfolio')

  const [filterState, setFilterState] = useState<PortfolioPositionsViewFiltersType>({
    showEmptyPositions: false,
  })

  const updatePortfolioPositionsFilters =
    (changeType: keyof PortfolioPositionsViewFiltersType) =>
    (value: GenericSelectOption | boolean | string[]) => {
      setFilterState((prevState) => ({
        ...prevState,
        // value is either a GenericSelectOption (with value.value), an array (of products) or a boolean (show empty)
        [changeType]: Array.isArray(value) || typeof value === 'boolean' ? value : value.value,
      }))
    }

  const filteredEmptyPositions = useMemo(() => {
    if (!portfolioPositionsData || !migrationPositions) return undefined

    const allPositions = [
      ...portfolioPositionsData.positions,
      ...(getLocalAppConfig('features').EnableMigrations ? migrationPositions : []),
    ]
    // empty positions first
    const positionsWithValue = allPositions.filter(
      filterEmptyPosition(filterState['showEmptyPositions']),
    )
    return positionsWithValue
  }, [filterState, portfolioPositionsData, migrationPositions])

  const filteredPositionsByProduct = useMemo(() => {
    if (!filteredEmptyPositions) return undefined

    // filter by product
    const noneSelected = [0, undefined].includes(filterState['product']?.length) // none selected = "All products"
    const allSelected =
      filterState['product']?.length === Object.values(PortfolioProductType).length // all selected manually
    const includeMigrated = filterState['product']?.includes(PortfolioProductType.migrate) // include migrated positions

    const filteredProductPositions = filteredEmptyPositions.filter((position) => {
      if (noneSelected || allSelected) {
        return true
      }
      return (
        filterState['product']?.includes(
          // filter by product type
          position.type?.toLocaleLowerCase() as PortfolioProductType,
        ) ||
        (includeMigrated && position.availableToMigrate) // special case for migration positions
      )
    })

    return filteredProductPositions
  }, [filterState, filteredEmptyPositions])

  const sortedPositions = useMemo(() => {
    if (!filteredPositionsByProduct) return undefined

    return filteredPositionsByProduct
      .sort((a, b) => {
        if (filterState['sorting'] === PortfolioSortingType.netValueAscending) {
          return a.netValue - b.netValue
        }
        return b.netValue - a.netValue
      })
      .sort((a, b) => {
        // move migration positions to the bottom
        if (a.availableToMigrate) return 1
        if (b.availableToMigrate) return -1
        return 0
      })
  }, [filterState, filteredPositionsByProduct])

  const hiddenPositionsCount = portfolioPositionsData
    ? portfolioPositionsData.positions.length -
      portfolioPositionsData.positions.filter(filterEmptyPosition()).length
    : 0

  const migrationPositionsEmpty = migrationPositions && migrationPositions.length === 0
  const positionsEmpty = portfolioPositionsData && portfolioPositionsData.positions.length === 0

  return (
    <Grid variant="portfolio">
      <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
        {portfolioPositionsData?.error ? (
          <EmptyState header={tPortfolio('empty-states.no-positions-error')} type="error">
            {tPortfolio('empty-states.try-again')}
          </EmptyState>
        ) : positionsEmpty && migrationPositionsEmpty ? (
          <EmptyState header={tPortfolio('empty-states.no-positions')}>
            {isOwner && tPortfolio('empty-states.owner')}
          </EmptyState>
        ) : (
          <>
            <Flex
              sx={{
                flexDirection: ['column', 'row'],
                justifyContent: 'space-between',
                alignItems: ['flex-start', 'center'],
              }}
            >
              <Flex sx={{ flexDirection: 'row', mt: [2, 0] }}>
                <PortfolioPositionsProductSelect
                  onChange={updatePortfolioPositionsFilters('product')}
                />
                <PortfolioPositionsSortingSelect
                  onChange={updatePortfolioPositionsFilters('sorting')}
                />
              </Flex>
              <Flex
                sx={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: ['space-between', 'flex-end'],
                  mt: [3, 0],
                  width: ['100%', 'auto'],
                }}
              >
                <Text variant="paragraph3" sx={{ mr: 1 }}>
                  {tPortfolio('show-empty-positions.label', { count: hiddenPositionsCount })}
                </Text>
                <StatefulTooltip
                  tooltip={tPortfolio('show-empty-positions.tooltip')}
                  containerSx={{ position: 'relative', mr: 1, width: ['40%', 'auto'] }}
                  tooltipSx={{
                    top: '24px',
                    width: ['200px', '250px'],
                    fontSize: 1,
                    whiteSpace: 'initial',
                    textAlign: 'left',
                    border: 'none',
                    borderRadius: 'medium',
                    boxShadow: 'buttonMenu',
                  }}
                >
                  <Icon size={16} icon={question_o} color="neutral80" />
                </StatefulTooltip>
                <Toggle
                  isChecked={filterState['showEmptyPositions']}
                  onChange={updatePortfolioPositionsFilters('showEmptyPositions')}
                />
              </Flex>
            </Flex>
            <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
              {sortedPositions ? (
                <>
                  {sortedPositions.length === 0 ? (
                    <EmptyState header={tPortfolio('empty-states.no-filtered-positions')}>
                      {isOwner && tPortfolio('empty-states.owner')}
                    </EmptyState>
                  ) : (
                    sortedPositions.map((position) => (
                      <PortfolioPositionBlock
                        key={`${position.positionId}-${position.protocol}-${position.network}-${position.type}-${position.primaryToken}-${position.secondaryToken}`}
                        position={position}
                      />
                    ))
                  )}
                </>
              ) : (
                <Flex sx={{ flexDirection: 'column', rowGap: '24px' }}>
                  {Array.from({ length: 3 }).map((_, index) => (
                    <PortfolioPositionBlockLoadingState key={`skeleton-${index}`} />
                  ))}
                </Flex>
              )}
            </Flex>
          </>
        )}

        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h2" variant="header5" sx={getGradientColor(summerBrandGradient)}>
            <Icon icon={sparks} color="#007DA3" sx={{ mr: 1 }} />
            {tPortfolio(`featured-for-${isOwner ? 'you' : 'address'}`, {
              address: formatAddress(address, 6),
            })}
          </Heading>
          <AppLink href={INTERNAL_LINKS.earn} sx={{ mr: 3 }}>
            <WithArrow sx={{ color: 'neutral80' }}>{tPortfolio('see-all-strategies')}</WithArrow>
          </AppLink>
        </Flex>
        <PortfolioPositionFeatured
          assets={portfolioWalletData?.assets}
          positions={portfolioPositionsData?.positions}
        />
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Heading as="h2" variant="header5">
            {tPortfolio('learn-with-summer-fi')}
          </Heading>
          <AppLink href={EXTERNAL_LINKS.BLOG.LEARN} sx={{ mr: 3 }}>
            <WithArrow sx={{ color: 'neutral80' }}>{tPortfolio('see-our-blog')}</WithArrow>
          </AppLink>
        </Flex>
        <PortfolioPositionLearn posts={blogPosts?.learn} />
      </Flex>
      <Box>
        <BlogPosts posts={blogPosts?.news} />
      </Box>
    </Grid>
  )
}
