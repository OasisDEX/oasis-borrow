import { Icon } from '@makerdao/dai-ui-icons'
import { AssetsTableBanner } from 'components/assetsTable/AssetsTableBanner'
import {
  AssetsTableHeaderTranslationProps,
  AssetsTableProps,
  AssetsTableRowData,
} from 'components/assetsTable/types'
import { StatefulTooltip } from 'components/Tooltip'
import { getRowKey } from 'features/discover/helpers'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex } from 'theme-ui'

interface AssetsTableHeaderCellProps {
  first: boolean
  headerTranslationProps?: AssetsTableHeaderTranslationProps
  isWithFollow: boolean
  label: string
  last: boolean
  tooltip: boolean
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
  const rowKeys = Object.keys(rows[0])
  const bannerRows = Math.min(rows.length - 1, 9)

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
                first={i === 0}
                headerTranslationProps={headerTranslationProps}
                isWithFollow={isWithFollow}
                label={label}
                last={i + 1 === rowKeys.length}
                tooltip={tooltips.includes(label)}
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
          {rows.map((row, i) => (
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
  first,
  headerTranslationProps,
  isWithFollow,
  label,
  last,
  tooltip,
}: AssetsTableHeaderCellProps) {
  const { t } = useTranslation()

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
        '&:first-child > span': {
          justifyContent: 'flex-start',
        },
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
        as="span"
        sx={{
          position: 'relative',
          alignItems: 'center',
          width: '100%',
          justifyContent: 'flex-end',
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
      {row[label]}
    </Box>
  )
}
