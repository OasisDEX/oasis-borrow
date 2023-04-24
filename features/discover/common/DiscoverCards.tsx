import { DiscoverTableProps } from 'features/discover/common/DiscoverTable'
import { DiscoverTableBanner } from 'features/discover/common/DiscoverTableBanner'
import { DiscoverTableDataCellContent } from 'features/discover/common/DiscoverTableDataCellContent'
import { getRowKey } from 'features/discover/helpers'
import { DiscoverFollow } from 'features/discover/meta'
import { DiscoverTableRowData } from 'features/discover/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment, isValidElement } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

const fullWidthColumns = ['asset', 'cdpId']

export function DiscoverCards({
  banner,
  follow,
  isLoading = false,
  kind,
  rows = [],
  skip = [],
  onBannerClick,
  onPositionClick,
}: Omit<DiscoverTableProps, 'isSticky' | 'tooltips'>) {
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
          '.discover-action': {
            width: '100%',
          },
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={getRowKey(i, row)}>
            <DiscoverCard follow={follow} row={row} skip={skip} onPositionClick={onPositionClick} />
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
  follow,
  row,
  skip,
  onPositionClick,
}: {
  follow?: DiscoverFollow
  row: DiscoverTableRowData
  skip: string[]
  onPositionClick?: (cdpId: string) => void
}) {
  const { t } = useTranslation()
  const filteredRowKeys = Object.keys(row).filter((key) => !skip.includes(key))

  return (
    <Box as="li">
      <Grid
        as="ul"
        sx={{ gridTemplateColumns: ['100%', 'repeat(2, 1fr)'], gap: 4, p: 0, listStyle: 'none' }}
      >
        {filteredRowKeys.map((label, i) => (
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
            {!isValidElement(row[label]) ? (
              <DiscoverTableDataCellContent
                follow={follow}
                label={label}
                onPositionClick={onPositionClick}
                row={row}
              />
            ) : (
              row[label]
            )}
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
