import { AssetsTableBanner } from 'components/assetsTable/AssetsTableBanner'
import { AssetsTableProps, AssetsTableRowData } from 'components/assetsTable/types'
import { getRowKey } from 'features/discover/helpers'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

const fullWidthColumns = ['asset', 'cdpId']

type AssetsCardsProps = Omit<AssetsTableProps, 'isSticky' | 'tooltips'>

interface AssetCardProps {
  row: AssetsTableRowData
}

export function AssetsCards({ banner, isLoading = false, rows = [] }: AssetsCardsProps) {
  const bannerRows = Math.min(rows.length - 1, 9)

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
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={getRowKey(i, row)}>
            <AssetCard row={row} />
            {banner && i === Math.floor(bannerRows / 2) && (
              <Box as="li">
                <AssetsTableBanner {...banner} />
              </Box>
            )}
          </Fragment>
        ))}
      </Flex>
    </Box>
  )
}

export function AssetCard({ row }: AssetCardProps) {
  const { t } = useTranslation()
  const rowKeys = Object.keys(row)

  return (
    <Box as="li">
      <Grid
        as="ul"
        sx={{ gridTemplateColumns: ['100%', 'repeat(2, 1fr)'], gap: 4, p: 0, listStyle: 'none' }}
      >
        {rowKeys.map((label, i) => (
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
            {row[label]}
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
