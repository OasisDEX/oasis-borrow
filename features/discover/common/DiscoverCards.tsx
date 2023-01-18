import { DiscoverTableBanner } from 'features/discover/common/DiscoverTableBanner'
import { DiscoverTableDataCellContent } from 'features/discover/common/DiscoverTableDataCellContent'
import { getRowKey } from 'features/discover/helpers'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

const fullWidthColumns = ['asset', 'cdpId']

export function DiscoverCards({
  banner,
  isLoading,
  kind,
  rows = [],
  onBannerClick,
  onPositionClick,
}: {
  banner?: DiscoverBanner
  isLoading: boolean
  kind?: DiscoverPages
  rows: DiscoverTableRowData[]
  onBannerClick?: (link: string) => void
  onPositionClick?: (cdpId: string) => void
}) {
  const rowsForBanner = Math.min(rows.length - 1, 9)

  return (
    <Box
      sx={{
        px: ['24px', null, null, 4],
        pt: 4,
        pb: '24px',
      }}
    >
      <Flex
        as="ul"
        sx={{
          listStyle: 'none',
          flexDirection: 'column',
          gap: 4,
          p: 0,
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: '200ms opacity',
          button: {
            width: '100%',
          },
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={getRowKey(i, row)}>
            <DiscoverCard row={row} onPositionClick={onPositionClick} />
            {kind && banner && i === Math.floor(rowsForBanner / 2) && (
              <Box as="li">
                <DiscoverTableBanner kind={kind} onBannerClick={onBannerClick} {...banner} />
              </Box>
            )}
          </Fragment>
        ))}
      </Flex>
    </Box>
  )
}

export function DiscoverCard({
  row,
  onPositionClick,
}: {
  row: DiscoverTableRowData
  onPositionClick?: (cdpId: string) => void
}) {
  const { t } = useTranslation()

  return (
    <Box as="li">
      <Grid
        as="ul"
        sx={{ gridTemplateColumns: ['100%', 'repeat(2, 1fr)'], gap: 4, p: 0, listStyle: 'none' }}
      >
        {Object.keys(row).map((label, i) => (
          <Box
            as="li"
            key={i}
            sx={{
              ...(fullWidthColumns.includes(label) && {
                gridColumnStart: ['span 1', 'span 2'],
              }),
            }}
          >
            {!fullWidthColumns.includes(label) && (
              <Box
                as="p"
                sx={{
                  mb: 2,
                  fontSize: 1,
                  fontWeight: 'semiBold',
                  color: 'neutral80',
                }}
              >
                {t(`discover.table.header.${kebabCase(label)}`)}
              </Box>
            )}
            <DiscoverTableDataCellContent
              label={label}
              row={row}
              onPositionClick={onPositionClick}
            />
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
