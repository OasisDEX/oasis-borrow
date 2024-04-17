import { ActionBanner } from 'components/ActionBanner'
import { AssetsTablePagination } from 'components/assetsTable/AssetsTablePagination'
import { getRowKey } from 'components/assetsTable/helpers/getRowKey'
import type {
  AssetsTableHeaderTranslationProps,
  AssetsTableProps,
  AssetsTableRowData,
  AssetsTableSortableCell,
} from 'components/assetsTable/types'
import { AppLink } from 'components/Links'
import { scrollTo } from 'helpers/scrollTo'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Box, Button, Flex, Grid } from 'theme-ui'

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
  perPage,
  rows = [],
}: AssetsCardsProps) {
  const [page, setPage] = useState<number>(1)
  const [rowsWithStickied, setRowsWithStickied] = useState<AssetsTableRowData[]>([])
  const [rowsWithoutStickied, setRowsWithoutStickied] = useState<AssetsTableRowData[]>([])
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const [_rowsWithStickied, _rowsWithoutStickied] = rows.reduce<
      [AssetsTableRowData[], AssetsTableRowData[]]
    >(
      ([withStickied, withoutStickied], current) => [
        [...withStickied, ...(current.isStickied ? [current] : [])],
        [...withoutStickied, ...(!current.isStickied ? [current] : [])],
      ],
      [[], []],
    )

    setPage(1)
    setRowsWithStickied(_rowsWithStickied)
    setRowsWithoutStickied(_rowsWithoutStickied)
  }, [rows])
  useEffect(() => {
    if ((container.current?.getBoundingClientRect().top ?? 0) < 0) scrollTo('assets-table')()
  }, [page])

  const resolvedPerPage = useMemo(
    () => (perPage ? perPage - rowsWithStickied.length : perPage),
    [perPage, rowsWithStickied.length],
  )

  const totalPages = useMemo(
    () => (resolvedPerPage ? Math.ceil(rowsWithoutStickied.length / resolvedPerPage) : 1),
    [resolvedPerPage, rowsWithoutStickied.length],
  )

  const paginatedRows = useMemo(
    () => [
      ...rowsWithStickied,
      ...(resolvedPerPage
        ? rowsWithoutStickied.slice((page - 1) * resolvedPerPage, page * resolvedPerPage)
        : rowsWithoutStickied),
    ],
    [page, resolvedPerPage, rowsWithStickied, rowsWithoutStickied],
  )

  const bannerRows = Math.min(paginatedRows.length - 1, 9)

  return (
    <Box
      id="assets-table"
      ref={container}
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
        {paginatedRows.map((row, i) => (
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
      {resolvedPerPage && totalPages > 1 && (
        <AssetsTablePagination
          onNextPage={() => setPage(Math.min(totalPages, page + 1))}
          onPrevPage={() => setPage(Math.max(1, page - 1))}
          page={page}
          totalPages={totalPages}
        />
      )}
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
          ...(row.isHighlighted && {
            py: 3,
            bg: '#fdf4f0',
            border: '1px solid',
            borderColor: '#f7ccbd',
            borderRadius: 'medium',
          }),
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
        {row.link && (
          <Box as="li" sx={{ gridColumnStart: ['span 1', 'span 2'] }}>
            <AppLink href={row.link}>
              <Button variant={row.isHighlighted ? 'action' : 'tertiary'} sx={{ width: '100%' }}>
                {t('open-position')}
              </Button>
            </AppLink>
          </Box>
        )}
      </Grid>
    </Box>
  )
}
