import { ActionBanner } from 'components/ActionBanner'
import { getRowKey } from 'components/assetsTable/helpers/getRowKey'
import type {
  AssetsTableHeaderTranslationProps,
  AssetsTableProps,
  AssetsTableRowData,
  AssetsTableSortableCell,
} from 'components/assetsTable/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

const fullWidthColumns = ['asset', 'action', 'cdpId', 'collateralDebt']

type AssetsCardsProps = Omit<AssetsTableProps, 'isSticky' | 'tooltips'>

interface AssetCardProps {
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  row: AssetsTableRowData
}

export function AssetsCards({
  banner,
  headerTranslationProps,
  isLoading = false,
  rows = [],
}: AssetsCardsProps) {
  const bannerRows = Math.min(rows.length - 1, 9)

  return (
    <Box
      sx={{
        pt: 4,
        pb: 3,
      }}
    >
      <Flex
        as="ul"
        sx={{
          listStyle: 'none',
          flexDirection: 'column',
          gap: '24px',
          p: 0,
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: '200ms opacity',
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={getRowKey(i, row)}>
            <AssetCard headerTranslationProps={headerTranslationProps} row={row} />
            {banner && i === Math.floor(bannerRows / 2) && (
              <Box as="li">
                <ActionBanner {...banner} />
              </Box>
            )}
          </Fragment>
        ))}
      </Flex>
    </Box>
  )
}

export function AssetCard({ headerTranslationProps, row }: AssetCardProps) {
  const { t } = useTranslation()
  const rowKeys = Object.keys(row.items)

  return (
    <Box
      as="li"
      sx={{
        pb: '24px',
        borderBottom: '1px solid',
        borderColor: 'neutral20',
        '&:last-of-type': {
          pb: 4,
          borderBottom: 'none',
        },
      }}
    >
      <Grid
        as="ul"
        sx={{
          gridTemplateColumns: ['100%', 'repeat(2, 1fr)'],
          gap: 4,
          px: 3,
          listStyle: 'none',
        }}
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
                {t(`discover.table.header.${kebabCase(label)}`, headerTranslationProps)}
              </Box>
            )}
            {(row.items[label] as AssetsTableSortableCell).value || row.items[label]}
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
