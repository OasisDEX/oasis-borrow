import type { GenericSelectOption } from 'components/GenericSelect'
import { Icon } from 'components/Icon'
import { PortfolioPositionsProductSelect } from 'components/portfolio/positions/PortfolioPositionsProductSelect'
import { PortfolioPositionsSortingSelect } from 'components/portfolio/positions/PortfolioPositionsSortingSelect'
import { Toggle } from 'components/Toggle'
import { StatefulTooltip } from 'components/Tooltip'
import type { PortfolioPositionsReply } from 'features/portfolio/types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Flex, Grid, Text } from 'theme-ui'
import { question_o } from 'theme/icons'
import { useFetch } from 'usehooks-ts'

import { PortfolioPositionBlock } from './PortfolioPositionBlock'
import { PortfolioPositionBlockSkeleton } from './PortfolioPositionBlockSkeleton'
import type { PortfolioProductType, PortfolioSortingType } from './types'

type PortfolioPositionsViewFiltersType = {
  showEmptyPositions: boolean
  product?: PortfolioProductType
  sorting?: PortfolioSortingType
}

export const PortfolioPositionsView = ({ address }: { address: string }) => {
  const { t: tPortfolio } = useTranslation('portfolio')
  const { data: portfolioPositionsData } = useFetch<PortfolioPositionsReply>(
    `/api/portfolio/positions/${address}`,
  )

  const [filterState, setFilterState] = useState<PortfolioPositionsViewFiltersType>({
    showEmptyPositions: false,
  })

  const updatePortfolioPositionsFilters =
    (changeType: keyof PortfolioPositionsViewFiltersType) =>
    (value: GenericSelectOption | boolean) => {
      setFilterState((prevState) => ({
        ...prevState,
        [changeType]: typeof value === 'boolean' ? value : value.value,
      }))
    }

  return (
    <Grid variant="vaultContainer">
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
              {tPortfolio('show-empty-positions')}
            </Text>
            <StatefulTooltip
              tooltip={<>What do you want to know?</>}
              containerSx={{ mr: 2, ml: '-10px' }}
              tooltipSx={{
                ml: '-75px',
                width: '150px',
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
          {portfolioPositionsData?.positions
            ? portfolioPositionsData.positions.map((position) => (
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
        <Text variant="boldParagraph2">News & Updates</Text>
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
      </Box>
    </Grid>
  )
}
