import { DiscoveryTableBanner } from 'features/discovery/common/DiscoveryTableBanner'
import { DiscoveryTableDataCellContent } from 'features/discovery/common/DiscoveryTableDataCellContent'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages, DiscoveryTableRowData } from 'features/discovery/types'
import { AppSpinner } from 'helpers/AppSpinner'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Text } from 'theme-ui'

export function DiscoveryTable({
  banner,
  isLoading,
  kind,
  rows = [],
}: {
  banner?: DiscoveryBanner
  isLoading: boolean
  kind: DiscoveryPages
  rows?: DiscoveryTableRowData[]
}) {
  const { t } = useTranslation()

  return (
    <Box
      sx={{
        position: 'relative',
        px: 4,
        pb: 1,
        minHeight: '80px',
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
        ...(rows.length > 0 && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '52px',
            left: 0,
            right: 0,
            height: '1px',
            backgroundColor: 'neutral20',
          },
        }),
      }}
    >
      {rows.length > 0 && (
        <Box
          as="table"
          sx={{
            width: '100%',
            borderSpacing: '0 20px',
            opacity: isLoading ? 0.5 : 1,
            pointerEvents: isLoading ? 'none' : 'auto',
            transition: '200ms opacity',
          }}
        >
          <Box as="thead">
            <tr>
              {Object.keys(rows[0]).map((label, i) => (
                <DiscoveryTableHeaderCell key={i} label={label} />
              ))}
            </tr>
          </Box>
          <Box as="tbody" sx={{ borderSpacing: '12px 0' }}>
            {rows.map((row, i) => (
              <Fragment key={i}>
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
      )}
      {rows.length === 0 && !isLoading && (
        <Text as="p" variant="paragraph2" sx={{ py: 4 }}>
          {t('discovery.table.no-entries')}
        </Text>
      )}
      {isLoading && (
        <AppSpinner
          sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, margin: 'auto' }}
          variant="extraLarge"
        />
      )}
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
        <DiscoveryTableDataCell key={i} label={label} row={row} />
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
        '&:first-child': {
          textAlign: 'left',
        },
      }}
    >
      <DiscoveryTableDataCellContent label={label} row={row} />
    </Box>
  )
}
