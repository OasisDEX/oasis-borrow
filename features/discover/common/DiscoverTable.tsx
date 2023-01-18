import { Icon } from '@makerdao/dai-ui-icons'
import { StatefulTooltip } from 'components/Tooltip'
import { DiscoverTableBanner } from 'features/discover/common/DiscoverTableBanner'
import { DiscoverTableDataCellContent } from 'features/discover/common/DiscoverTableDataCellContent'
import { getRowKey } from 'features/discover/helpers'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex } from 'theme-ui'

export function DiscoverTable({
  banner,
  isLoading = false,
  isSticky = false,
  kind,
  rows,
  skip = [],
  tooltips = [],
  onPositionClick,
  onBannerClick,
}: {
  banner?: DiscoverBanner
  isLoading?: boolean
  isSticky?: boolean
  kind?: DiscoverPages
  rows: DiscoverTableRowData[]
  tooltips?: string[]
  skip?: string[]
  onBannerClick?: (link: string) => void
  onPositionClick?: (cdpId: string) => void
}) {
  const filteredRowKeys = Object.keys(rows[0]).filter((key) => !skip.includes(key))
  const rowsForBanner = Math.min(rows.length - 1, 9)

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
            {filteredRowKeys.map((label, i) => (
              <DiscoverTableHeaderCell
                key={getRowKey(i, rows[0])}
                first={i === 0}
                last={i + 1 === filteredRowKeys.length}
                label={label}
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
              <DiscoverTableDataRow
                filteredRowKeys={filteredRowKeys}
                row={row}
                onPositionClick={onPositionClick}
              />
              {kind && banner && i === Math.floor(rowsForBanner / 2) && (
                <tr>
                  <td colSpan={Object.keys(row).length}>
                    <DiscoverTableBanner kind={kind} onBannerClick={onBannerClick} {...banner} />
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

export function DiscoverTableHeaderCell({
  first,
  last,
  label,
  tooltip,
}: {
  first: boolean
  last: boolean
  label: string
  tooltip: boolean
}) {
  const { t } = useTranslation()

  return (
    <Box
      as="th"
      sx={{
        position: 'relative',
        px: '12px',
        py: '20px',
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
        {t(`discover.table.header.${kebabCase(label)}`)}
        {tooltip && (
          <StatefulTooltip
            containerSx={{ ml: 1 }}
            tooltip={t(`discover.table.tooltip.${kebabCase(label)}`)}
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

export function DiscoverTableDataRow({
  row,
  filteredRowKeys,
  onPositionClick,
}: {
  row: DiscoverTableRowData
  filteredRowKeys: string[]
  onPositionClick?: (cdpId: string) => void
}) {
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
      {filteredRowKeys.map((label, i) => (
        <DiscoverTableDataCell
          key={getRowKey(i, row)}
          label={label}
          row={row}
          onPositionClick={onPositionClick}
        />
      ))}
    </Box>
  )
}

export function DiscoverTableDataCell({
  label,
  row,
  onPositionClick,
}: {
  label: string
  row: DiscoverTableRowData
  onPositionClick?: (cdpId: string) => void
}) {
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
      <DiscoverTableDataCellContent label={label} row={row} onPositionClick={onPositionClick} />
    </Box>
  )
}
