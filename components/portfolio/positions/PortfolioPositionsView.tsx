import type { GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { BlogPosts } from 'components/portfolio/blog-posts/BlogPosts'
import { PortfolioPositionBlock } from 'components/portfolio/positions/PortfolioPositionBlock'
import { PortfolioPositionBlockSkeleton } from 'components/portfolio/positions/PortfolioPositionBlockSkeleton'
import { PortfolioPositionsProductSelect } from 'components/portfolio/positions/PortfolioPositionsProductSelect'
import { PortfolioPositionsSortingSelect } from 'components/portfolio/positions/PortfolioPositionsSortingSelect'
import { PortfolioProductType, PortfolioSortingType } from 'components/portfolio/positions/types'
import { Toggle } from 'components/Toggle'
import { StatefulTooltip } from 'components/Tooltip'
import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { question_o } from 'theme/icons'
import { Box, Flex, Grid, Text } from 'theme-ui'

import type { PortfolioPositionsResponse } from 'lambdas/src/shared/domain-types'

type PortfolioPositionsViewFiltersType = {
  showEmptyPositions: boolean
  product?: PortfolioProductType[]
  sorting?: PortfolioSortingType
}

export const PortfolioPositionsView = ({
  address,
  fetchData,
}: {
  address: string
  fetchData: (address: string) => Promise<PortfolioPositionsResponse>
}) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  // fetch data
  const [portfolioPositionsData, setPortfolioPositionsData] = useState<PortfolioPositionsResponse>()
  useEffect(() => {
    void fetchData(address).then((data) => {
      setPortfolioPositionsData(data)
    })
  }, [address, fetchData])

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
            <Text variant="paragraph3" sx={{ mr: 3 }}>
              {tPortfolio('show-empty-positions.label')}
            </Text>
            <StatefulTooltip
              tooltip={
                <Text variant="paragraph4">{tPortfolio('show-empty-positions.tooltip')}</Text>
              }
              containerSx={{ mr: 2, ml: '-10px' }}
              tooltipSx={{
                ml: '-75px',
                width: '300px',
                borderRadius: 'medium',
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
        <Box sx={{ pt: 4 }}>
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
        </Box>
      </Box>
      <Box>
        <Text variant="boldParagraph2">Summer.fi Activity</Text>
        <Box
          sx={{
            height: '300px',
            border: '1px solid',
            borderColor: 'neutral20',
            borderRadius: 'round',
            mt: 3,
            mb: 4,
            overflow: 'hidden',
            padding: 3,
          }}
        />
        <BlogPosts />
      </Box>
    </Grid>
  )
}
