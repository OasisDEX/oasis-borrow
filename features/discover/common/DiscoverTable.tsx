import { MixpanelUserContext } from 'analytics/analytics'
import { DiscoverTableBanner } from 'features/discover/common/DiscoverTableBanner'
import { DiscoverTableDataCellContent } from 'features/discover/common/DiscoverTableDataCellContent'
import { getRowKey } from 'features/discover/helpers'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages, DiscoverTableRowData } from 'features/discover/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box } from 'theme-ui'

export function DiscoverTable({
  banner,
  isLoading = false,
  isSticky = false,
  kind,
  rows,
  userContext,
}: {
  banner?: DiscoverBanner
  isLoading?: boolean
  isSticky?: boolean
  kind: DiscoverPages
  rows: DiscoverTableRowData[]
  userContext?: MixpanelUserContext
}) {
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
            {Object.keys(rows[0]).map((label, i) => (
              <DiscoverTableHeaderCell
                key={getRowKey(i, rows[0])}
                first={i === 0}
                last={i + 1 === Object.keys(rows[0]).length}
                label={label}
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
              <DiscoverTableDataRow kind={kind} row={row} />
              {banner && i === Math.floor(rowsForBanner / 2) && (
                <tr>
                  <td colSpan={Object.keys(row).length}>
                    <DiscoverTableBanner kind={kind} userContext={userContext} {...banner} />
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
}: {
  first: boolean
  last: boolean
  label: string
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
        textAlign: 'right',
        whiteSpace: 'nowrap',
        '&:first-child': {
          textAlign: 'left',
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
      <Box as="span" sx={{ position: 'relative' }}>
        {t(`discover.table.header.${kebabCase(label)}`)}
      </Box>
    </Box>
  )
}

export function DiscoverTableDataRow({
  kind,
  row,
}: {
  kind: DiscoverPages
  row: DiscoverTableRowData
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
      {Object.keys(row).map((label, i) => (
        <DiscoverTableDataCell key={getRowKey(i, row)} kind={kind} label={label} row={row} />
      ))}
    </Box>
  )
}

export function DiscoverTableDataCell({
  kind,
  label,
  row,
}: {
  kind: DiscoverPages
  label: string
  row: DiscoverTableRowData
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
      <DiscoverTableDataCellContent kind={kind} label={label} row={row} />
    </Box>
  )
}
