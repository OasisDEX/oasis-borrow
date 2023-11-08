import type { GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { BlogPosts } from 'components/portfolio/blog-posts/BlogPosts'
import { PortfolioPositionBlock } from 'components/portfolio/positions/PortfolioPositionBlock'
import { PortfolioPositionBlockSkeleton } from 'components/portfolio/positions/PortfolioPositionBlockSkeleton'
import { PortfolioPositionFeatured } from 'components/portfolio/positions/PortfolioPositionFeatured'
import { PortfolioPositionsProductSelect } from 'components/portfolio/positions/PortfolioPositionsProductSelect'
import { PortfolioPositionsSortingSelect } from 'components/portfolio/positions/PortfolioPositionsSortingSelect'
import { PortfolioProductType, PortfolioSortingType } from 'components/portfolio/positions/types'
import { PortfolioWalletHistory } from 'components/portfolio/wallet-history/PortfolioWalletHistory'
import { Toggle } from 'components/Toggle'
import { StatefulTooltip } from 'components/Tooltip'
import { formatAddress } from 'helpers/formatters/format'
import { getGradientColor, summerBrandGradient } from 'helpers/getGradientColor'
import type { BlogPostsReply } from 'helpers/types/blog-posts.types'
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { question_o, sparks } from 'theme/icons'
import { Box, Flex, Grid, Heading, Text } from 'theme-ui'

import type { PortfolioPositionsResponse } from 'lambdas/src/shared/domain-types'

interface PortfolioPositionsViewProps {
  address: string
  blogPosts?: BlogPostsReply
  isOwner: boolean
  portfolioPositionsData?: PortfolioPositionsResponse
}

type PortfolioPositionsViewFiltersType = {
  product?: PortfolioProductType[]
  showEmptyPositions: boolean
  sorting?: PortfolioSortingType
}

export const PortfolioPositionsView = ({
  address,
  isOwner,
  portfolioPositionsData,
  blogPosts,
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

  const filteredAndSortedPositions = useMemo(() => {
    if (!portfolioPositionsData?.positions) return []
    // empty positions first
    const filteredEmptyPositions = portfolioPositionsData.positions.filter(
      ({ tokens }) => filterState['showEmptyPositions'] || tokens.supply.amountUSD > 0,
    )
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

    const sortedPositions = filteredProductPositions
      .sort((a, b) => {
        if (filterState['sorting'] === PortfolioSortingType.netValueAscending) {
          return a.tokens.supply.amountUSD - b.tokens.supply.amountUSD
        }
        return b.tokens.supply.amountUSD - a.tokens.supply.amountUSD
      })
      .sort((a, b) => {
        // move migration positions to the bottom
        if (a.availableToMigrate) return 1
        if (b.availableToMigrate) return -1
        return 0
      })

    return sortedPositions
  }, [filterState, portfolioPositionsData])

  return (
    <Grid variant="portfolio">
      <Box>
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
              {tPortfolio('show-empty-positions.label')}
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
        <Flex sx={{ flexDirection: 'column', rowGap: '24px', pt: 4 }}>
          {filteredAndSortedPositions
            ? filteredAndSortedPositions.map((position) => (
                <PortfolioPositionBlock
                  key={`${position.positionId}-${position.protocol}-${position.network}`}
                  position={position}
                />
              ))
            : Array.from({ length: 3 }).map((_, index) => (
                <PortfolioPositionBlockSkeleton key={`skeleton-${index}`} />
              ))}
        </Flex>
        <Flex sx={{ alignItems: 'center', my: '24px' }}>
          <Icon icon={sparks} color="#007DA3" />
          <Heading
            as="h2"
            variant="header5"
            sx={{ ml: 1, ...getGradientColor(summerBrandGradient) }}
          >
            {tPortfolio(`featured-for-${isOwner ? 'you' : 'address'}`, {
              address: formatAddress(address, 6),
            })}
          </Heading>
        </Flex>
        <PortfolioPositionFeatured />
      </Box>
      <Box>
        <PortfolioWalletHistory walletHistoryData={/* mock here */} />
        <BlogPosts posts={blogPosts} />
      </Box>
    </Grid>
  )
}
