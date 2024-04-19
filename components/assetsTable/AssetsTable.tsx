import { ActionBanner } from 'components/ActionBanner'
import { AssetsTablePagination } from 'components/assetsTable/AssetsTablePagination'
import { AssetsTableSeparator } from 'components/assetsTable/AssetsTableSeparator'
import { getRowKey } from 'components/assetsTable/helpers/getRowKey'
import { sortRows } from 'components/assetsTable/helpers/sortRows'
import type {
  AssetsTableHeaderTranslationProps,
  AssetsTableProps,
  AssetsTableRowData,
  AssetsTableSortableCell,
  AssetsTableSortingSettings,
} from 'components/assetsTable/types'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { Icon } from 'components/Icon'
import { StatefulTooltip } from 'components/Tooltip'
import { getRandomString } from 'helpers/getRandomString'
import { scrollTo } from 'helpers/scrollTo'
import { kebabCase } from 'lodash'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { question_o } from 'theme/icons'
import { Box, Flex } from 'theme-ui'

interface AssetsTableHeaderCellProps {
  first: boolean
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isSortable: boolean
  isSticky: boolean
  label: string
  last: boolean
  onSort?: (label: string) => void
  paddless?: boolean
  sortingSettings?: AssetsTableSortingSettings
  tooltip: boolean
}

interface AssetsTableDataRowProps {
  row: AssetsTableRowData
  rowKeys: string[]
  verticalAlign?: string
}

interface AssetsTableDataCellProps {
  label: string
  row: AssetsTableRowData
  verticalAlign?: string
}

export function AssetsTable({
  banner,
  headerTranslationProps,
  isLoading = false,
  isSticky = false,
  limitRows,
  paddless,
  perPage,
  rows,
  separator,
  tooltips = [],
  verticalAlign,
}: AssetsTableProps) {
  const [page, setPage] = useState<number>(1)
  const [rowsWithStickied, setRowsWithStickied] = useState<AssetsTableRowData[]>([])
  const [rowsWithoutStickied, setRowsWithoutStickied] = useState<AssetsTableRowData[]>([])
  const [sortingSettings, setSortingSettings] = useState<AssetsTableSortingSettings>()
  const [rowKeys, setRowKeys] = useState<string[]>([])
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
    setRowKeys(Object.keys(rows[0]?.items ?? []))
    setRowsWithStickied(_rowsWithStickied)
    setRowsWithoutStickied(_rowsWithoutStickied)
    setSortingSettings(undefined)
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

  const sortedRows = useMemo(
    () =>
      sortingSettings
        ? sortRows({ rows: rowsWithoutStickied, sortingSettings })
        : rowsWithoutStickied,
    [sortingSettings, rowsWithoutStickied],
  )

  const paginatedRows = useMemo(
    () => [
      ...rowsWithStickied,
      ...(resolvedPerPage
        ? sortedRows.slice((page - 1) * resolvedPerPage, page * resolvedPerPage)
        : limitRows
          ? sortedRows.slice(0, limitRows)
          : sortedRows),
    ],
    [limitRows, page, resolvedPerPage, rowsWithStickied, sortedRows],
  )

  const bannerRows = Math.min(paginatedRows.length - 1, 9)

  function onSortHandler(label: string) {
    setPage(1)
    if (sortingSettings?.direction === undefined || sortingSettings?.key !== label)
      setSortingSettings({ direction: 'desc', key: label })
    else if (sortingSettings?.direction === 'desc')
      setSortingSettings({ direction: 'asc', key: label })
    else setSortingSettings(undefined)
  }

  return (
    <Box
      id="assets-table"
      ref={container}
      sx={{
        position: 'relative',
        ...(!paddless && {
          px: ['24px', null, null, 0],
          pb: '24px',
          mt: '-8px',
        }),
      }}
    >
      <Box
        as="table"
        sx={{
          width: '100%',
          borderSpacing: paddless ? '0' : '0 8px',
        }}
      >
        <Box
          as="thead"
          sx={{
            ...(isSticky && {
              position: 'sticky',
              zIndex: 1,
              top: '88px',
            }),
          }}
        >
          <tr>
            {rowKeys.map((label, i) => (
              <AssetsTableHeaderCell
                key={getRowKey(i, paginatedRows[0])}
                first={i === 0}
                headerTranslationProps={headerTranslationProps}
                isSortable={
                  (paginatedRows[0].items[label] as AssetsTableSortableCell).sortable !== undefined
                }
                isSticky={isSticky}
                label={label}
                last={i + 1 === rowKeys.length}
                paddless={paddless}
                sortingSettings={sortingSettings}
                tooltip={tooltips.includes(label)}
                onSort={onSortHandler}
              />
            ))}
          </tr>
        </Box>
        <Box
          as="tbody"
          sx={{
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
            transition: '200ms opacity',
          }}
        >
          {paginatedRows.map((row, i) => (
            <Fragment key={getRowKey(i, row)}>
              <AssetsTableDataRow
                key={getRandomString()}
                row={row}
                rowKeys={rowKeys}
                verticalAlign={verticalAlign}
              />
              {banner && i === Math.floor(bannerRows / 2) && (
                <tr>
                  <td colSpan={Object.keys(row.items).length}>
                    <ActionBanner {...banner} />
                  </td>
                </tr>
              )}
              {separator &&
                (page - 1) * (resolvedPerPage ?? 0) + i + 1 === separator.index &&
                sortingSettings === undefined && (
                  <tr>
                    <td colSpan={Object.keys(row.items).length}>
                      <AssetsTableSeparator text={separator.text} />
                    </td>
                  </tr>
                )}
            </Fragment>
          ))}
        </Box>
      </Box>
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

export function AssetsTableHeaderCell({
  first,
  headerTranslationProps,
  isSortable,
  isSticky,
  label,
  last,
  onSort,
  paddless,
  sortingSettings,
  tooltip,
}: AssetsTableHeaderCellProps) {
  const { t } = useTranslation()
  const isActive = isSortable && label === sortingSettings?.key

  return (
    <Box
      as="th"
      sx={{
        position: 'relative',
        px: '12px',
        pt: paddless ? 0 : '28px',
        pb: isSticky ? '48px' : '20px',
        fontSize: 1,
        fontWeight: 'semiBold',
        color: 'neutral80',
        lineHeight: '10px',
        textAlign: 'left',
        whiteSpace: 'nowrap',
      }}
    >
      <Box
        sx={{
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            left: first ? -4 : 0,
            right: last ? -4 : 0,
            bottom: '20px',
          },
          '&::before': {
            top: '-28px',
            backgroundColor: isSticky ? 'neutral10' : 'transparent',
          },
          '&::after': {
            height: '1px',
            backgroundColor: isSticky ? 'neutral20' : 'transparent',
          },
        }}
      />
      <Flex
        sx={{
          position: 'relative',
          alignItems: 'center',
          width: '100%',
          justifyContent: first ? 'flex-start' : 'flex-end',
        }}
      >
        <Flex
          sx={{
            alignItems: 'center',
            color: isActive ? 'primary100' : 'neutral80',
            transition: '200ms color',
            ...(isSortable && {
              cursor: 'pointer',
              userSelect: 'none',
              '&:hover': { color: 'primary100' },
            }),
          }}
          onClick={() => {
            if (isSortable && onSort) onSort(label)
          }}
        >
          {t(`discover.table.header.${kebabCase(label)}`, headerTranslationProps)}
          {tooltip && (
            <StatefulTooltip
              containerSx={{ ml: 1 }}
              tooltip={t(`discover.table.tooltip.${kebabCase(label)}`, headerTranslationProps)}
              tooltipSx={{
                width: '200px',
                px: 3,
                py: 2,
                borderRadius: 'medium',
                border: 'none',
                whiteSpace: 'initial',
                color: 'neutral80',
                lineHeight: 'body',
              }}
            >
              <Icon icon={question_o} size={16} color="neutral80" />
            </StatefulTooltip>
          )}
          {isSortable && (
            <Flex sx={{ flexDirection: 'column', rowGap: '2px', ml: 2 }}>
              <ExpandableArrow
                direction={isActive && sortingSettings?.direction === 'asc' ? 'up' : 'down'}
                size={10}
                color={isActive ? 'primary100' : 'neutral80'}
              />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Box>
  )
}

export function AssetsTableDataRow({ row, rowKeys, verticalAlign }: AssetsTableDataRowProps) {
  const { push } = useRouter()
  const ref = useRef<HTMLDivElement>(null)

  const hasUndisabledButton = useMemo(
    () => ref.current?.querySelector('.table-action-button:not(:disabled') !== null,
    [ref],
  )

  return (
    <Box
      ref={ref}
      as="tr"
      sx={{
        position: 'relative',
        borderRadius: 'medium',
        transition: 'box-shadow 200ms',
        ...((row.onClick || row.link || hasUndisabledButton) && {
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 'buttonMenu',
            '.table-action-button': {
              bg: 'secondary100',
            },
          },
        }),
      }}
      {...{
        ...(row.onClick
          ? {
              role: 'button',
              onClick: row.onClick,
            }
          : row.link
            ? {
                role: 'link',
                onClick: () => void push(row.link as string),
              }
            : hasUndisabledButton && {
                role: 'link',
                onClick: () => {
                  if (ref.current && ref.current.querySelector('.table-action-button'))
                    (ref.current.querySelector('.table-action-button') as HTMLButtonElement).click()
                },
              }),
      }}
    >
      {rowKeys.map((label, i) => (
        <AssetsTableDataCell
          key={getRowKey(i, row)}
          label={label}
          row={row}
          verticalAlign={verticalAlign}
        />
      ))}
    </Box>
  )
}

export function AssetsTableDataCell({ label, row, verticalAlign }: AssetsTableDataCellProps) {
  return (
    <Box
      as="td"
      sx={{
        p: '14px 12px',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        verticalAlign,
        ...(row.isHighlighted && {
          bg: '#fdf4f0',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: '#f7ccbd',
        }),
        '&:first-of-type': {
          textAlign: 'left',
          borderTopLeftRadius: 'medium',
          borderBottomLeftRadius: 'medium',
          ...(row.isHighlighted && {
            borderLeft: '1px solid',
            borderColor: '#f7ccbd',
          }),
        },
        '&:last-of-type': {
          borderTopRightRadius: 'medium',
          borderBottomRightRadius: 'medium',
          ...(row.isHighlighted && {
            borderRight: '1px solid',
            borderColor: '#f7ccbd',
          }),
        },
      }}
    >
      {(row.items[label] as AssetsTableSortableCell)?.value ?? row.items[label]}
    </Box>
  )
}
