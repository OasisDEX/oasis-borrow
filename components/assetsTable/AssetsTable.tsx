import { ActionBanner } from 'components/ActionBanner'
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
import { kebabCase } from 'lodash'
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
  rows,
  tooltips = [],
}: AssetsTableProps) {
  const [sortingSettings, setSortingSettings] = useState<AssetsTableSortingSettings>()
  const rowKeys = Object.keys(rows[0].items)
  const bannerRows = Math.min(rows.length - 1, 9)

  const sortedRows = useMemo(
    () => (sortingSettings ? sortRows({ rows, sortingSettings }) : rows),
    [sortingSettings, rows],
  )

  function onSortHandler(label: string) {
    if (sortingSettings?.direction === undefined || sortingSettings?.key !== label)
      setSortingSettings({ direction: 'desc', key: label })
    else if (sortingSettings?.direction === 'desc')
      setSortingSettings({ direction: 'asc', key: label })
    else setSortingSettings(undefined)
  }

  return (
    <Box
      sx={{
        position: 'relative',
        px: ['24px', null, null, 4],
        pb: '24px',
        mt: '-8px',
      }}
    >
      <Box
        as="table"
        sx={{
          width: '100%',
          borderSpacing: '0 8px',
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
                key={getRowKey(i, rows[0])}
                first={i === 0}
                headerTranslationProps={headerTranslationProps}
                isSortable={
                  (rows[0].items[label] as AssetsTableSortableCell).sortable !== undefined
                }
                isSticky={isSticky}
                label={label}
                last={i + 1 === rowKeys.length}
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
          {sortedRows.map((row, i) => (
            <Fragment key={getRowKey(i, row)}>
              <AssetsTableDataRow key={getRandomString()} row={row} rowKeys={rowKeys} />
              {banner && i === Math.floor(bannerRows / 2) && (
                <tr>
                  <td colSpan={Object.keys(row.items).length}>
                    <ActionBanner {...banner} />
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
  first,
  headerTranslationProps,
  isSortable,
  isSticky,
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
        pt: '28px',
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

export function AssetsTableDataRow({ row, rowKeys }: AssetsTableDataRowProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hasUndisabledButton, setHasUndisabledButton] = useState<boolean>(false)

  useEffect(() => {
    setHasUndisabledButton(
      ref.current?.querySelector('.table-action-button:not(:disabled') !== null,
    )
  }, [ref])

  return (
    <Box
      ref={ref}
      as="tr"
      sx={{
        position: 'relative',
        borderRadius: 'medium',
        transition: 'box-shadow 200ms',
        ...((row.onClick || hasUndisabledButton) && {
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
        p: '14px 12px',
        textAlign: 'right',
        whiteSpace: 'nowrap',
        '&:first-of-type': {
          textAlign: 'left',
        },
      }}
    >
      {(row.items[label] as AssetsTableSortableCell).value || row.items[label]}
    </Box>
  )
}
