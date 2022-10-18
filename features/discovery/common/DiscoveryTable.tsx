import { DiscoveryTableBanner } from 'features/discovery/common/DiscoveryTableBanner'
import { DiscoveryTableDataCellContent } from 'features/discovery/common/DiscoveryTableDataCellContent'
import { getRowKey } from 'features/discovery/helpers'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages, DiscoveryTableRowData } from 'features/discovery/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box } from 'theme-ui'

export function DiscoveryTable({
  banner,
  isLoading,
  kind,
  rows = [],
}: {
  banner?: DiscoveryBanner
  isLoading: boolean
  kind: DiscoveryPages
  rows: DiscoveryTableRowData[]
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        px: ['24px', null, null, 4],
        pb: 1,
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '52px',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: 'neutral20',
        },
      }}
    >
      <Box
        as="table"
        sx={{
          width: '100%',
          borderSpacing: '0 20px',
        }}
      >
        <Box as="thead">
          <tr>
            {Object.keys(rows[0]).map((label, i) => (
              <DiscoveryTableHeaderCell key={getRowKey(i, rows[0])} label={label} />
            ))}
          </tr>
        </Box>
        <Box
          as="tbody"
          sx={{
            borderSpacing: '12px 0',
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
            transition: '200ms opacity',
          }}
        >
          {rows.map((row, i) => (
            <Fragment key={getRowKey(i, row)}>
              <DiscoveryTableDataRow row={row} />
              {banner && i === Math.floor((rows.length - 1) / 2) && (
                <tr>
                  <td colSpan={Object.keys(row).length}>
                    <DiscoveryTableBanner kind={kind} {...banner} />
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

export function DiscoveryTableHeaderCell({ label }: { label: string }) {
  const { t } = useTranslation()

  return (
    <Box
      as="th"
      sx={{
        px: '12px',
        pb: '20px',
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
      {t(`discovery.table.header.${kebabCase(label)}`)}
    </Box>
  )
}

export function DiscoveryTableDataRow({ row }: { row: DiscoveryTableRowData }) {
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
        <DiscoveryTableDataCell key={getRowKey(i, row)} label={label} row={row} />
      ))}
    </Box>
  )
}

export function DiscoveryTableDataCell({
  label,
  row,
}: {
  label: string
  row: DiscoveryTableRowData
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
      <DiscoveryTableDataCellContent label={label} row={row} />
    </Box>
  )
}
