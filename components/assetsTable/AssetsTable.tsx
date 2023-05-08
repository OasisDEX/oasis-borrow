import { Icon } from '@makerdao/dai-ui-icons'
import { AssetsTableBanner } from 'components/assetsTable/AssetsTableBanner'
import { getRowKey } from 'components/assetsTable/helpers/getRowKey'
import { sortRows } from 'components/assetsTable/helpers/sortRows'
import {
  AssetsTableHeaderTranslationProps,
  AssetsTableProps,
  AssetsTableRowData,
  AssetsTableSortableCell,
  AssetsTableSortingSettings,
} from 'components/assetsTable/types'
import { ExpandableArrow } from 'components/dumb/ExpandableArrow'
import { StatefulTooltip } from 'components/Tooltip'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment, useMemo, useState } from 'react'
import { Box, Flex } from 'theme-ui'

interface AssetsTableHeaderCellProps {
  isSortable: boolean
  first: boolean
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isWithFollow: boolean
  label: string
  last: boolean
  sortingSettings?: AssetsTableSortingSettings
  tooltip: boolean
  onSort?: (label: string) => void
}

interface AssetsTableDataRowProps {
  row: AssetsTableRowData
  rowKeys: string[]
}

interface AssetsTableDataCellProps {
  label: string
  row: AssetsTableRowData
}

export function AssetsTable({
  banner,
  headerTranslationProps,
  isLoading = false,
  isSticky = false,
  isWithFollow = false,
  rows,
  tooltips = [],
}: AssetsTableProps) {
  const [sortingSettings, setSortingSettings] = useState<AssetsTableSortingSettings>()
  const rowKeys = Object.keys(rows[0])
  const bannerRows = Math.min(rows.length - 1, 9)

  const sortedRows = useMemo(
    () => (sortingSettings ? sortRows({ rows, sortingSettings }) : rows),
    [sortingSettings, rows],
  )

  return (
    <Box
      sx={{
        position: 'relative',
        px: ['24px', null, null, 4],
        pb: 1,
        mt: '-20px',
      }}
    >
      <Box
        as="table"
        sx={{
          width: '100%',
          borderSpacing: '0 20px',
        }}
      >
        <Box
          as="thead"
          sx={{
            ...(isSticky && {
              position: 'sticky',
              zIndex: 1,
              top: '120px',
            }),
          }}
        >
          <tr>
            {rowKeys.map((label, i) => (
              <AssetsTableHeaderCell
                key={getRowKey(i, rows[0])}
                isSortable={(rows[0][label] as AssetsTableSortableCell).sortable !== undefined}
                first={i === 0}
                headerTranslationProps={headerTranslationProps}
                isWithFollow={isWithFollow}
                label={label}
                last={i + 1 === rowKeys.length}
                sortingSettings={sortingSettings}
                tooltip={tooltips.includes(label)}
                onSort={(selectedLabel) => {
                  if (
                    sortingSettings?.direction === undefined ||
                    sortingSettings?.key !== selectedLabel
                  )
                    setSortingSettings({ direction: 'desc', key: selectedLabel })
                  else if (sortingSettings?.direction === 'desc')
                    setSortingSettings({ direction: 'asc', key: selectedLabel })
                  else setSortingSettings(undefined)
                }}
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
          {sortedRows.map((row, i) => (
            <Fragment key={getRowKey(i, row)}>
              <AssetsTableDataRow row={row} rowKeys={rowKeys} />
              {banner && i === Math.floor(bannerRows / 2) && (
                <tr>
                  <td colSpan={Object.keys(row).length}>
                    <AssetsTableBanner {...banner} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export function AssetsTableHeaderCell({
  isSortable,
  first,
  headerTranslationProps,
  isWithFollow,
  label,
  last,
  sortingSettings,
  tooltip,
  onSort,
}: AssetsTableHeaderCellProps) {
  const { t } = useTranslation()
  const isActive = isSortable && label === sortingSettings?.key

  return (
    <Box
      as="th"
      sx={{
        position: 'relative',
        px: '12px',
        py: '20px',
        ...(first && isWithFollow && { pl: '80px' }),
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
            bottom: 0,
          },
          '&::before': {
            top: '-20px',
            backgroundColor: 'neutral10',
          },
          '&::after': {
            height: '1px',
            backgroundColor: 'neutral20',
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
              <Icon name="question_o" size={16} color="neutral80" />
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

export function AssetsTableDataRow({ row, rowKeys }: AssetsTableDataRowProps) {
  return (
    <Box
      as="tr"
      sx={{
        borderRadius: 'medium',
        transition: 'box-shadow 200ms',
        '&:hover': {
          boxShadow: 'buttonMenu',
        },
      }}
    >
      {rowKeys.map((label, i) => (
        <AssetsTableDataCell key={getRowKey(i, row)} label={label} row={row} />
      ))}
    </Box>
  )
}

export function AssetsTableDataCell({ label, row }: AssetsTableDataCellProps) {
  return (
    <Box
      as="td"
      sx={{
        p: '8px 12px',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        '&:first-child': {
          textAlign: 'left',
        },
      }}
    >
      {(row[label] as AssetsTableSortableCell).value || row[label]}
    </Box>
  )
}
