import { DiscoveryTableBanner } from 'features/discovery/common/DiscoveryTableBanner'
import { DiscoveryTableDataCellContent } from 'features/discovery/common/DiscoveryTableDataCellContent'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages, DiscoveryTableRowData } from 'features/discovery/types'
import { kebabCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { Fragment } from 'react'
import { Box, Flex, Grid } from 'theme-ui'

const fullWidthColumns = ['asset', 'cdpId']

export function DiscoveryCards({
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
        mt: '12px',
        px: ['24px', null, null, 4],
        pt: 4,
        pb: '24px',
        borderTop: '1px solid',
        borderTopColor: 'neutral20',
      }}
    >
      <Flex
        as="ul"
        sx={{
          listStyle: 'none',
          flexDirection: 'column',
          gap: 4,
          p: 0,
          opacity: isLoading ? 0.5 : 1,
          pointerEvents: isLoading ? 'none' : 'auto',
          transition: '200ms opacity',
          button: {
            width: '100%',
          },
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={i}>
            <DiscoveryCard row={row} />
            {banner && i === Math.floor((rows.length - 1) / 2) && (
              <Box as="li">
                <DiscoveryTableBanner kind={kind} {...banner} />
              </Box>
            )}
          </Fragment>
        ))}
      </Flex>
    </Box>
  )
}

export function DiscoveryCard({ row }: { row: DiscoveryTableRowData }) {
  const { t } = useTranslation()

  return (
    <Box as="li">
      <Grid
        as="ul"
        sx={{ gridTemplateColumns: ['100%', 'repeat(2, 1fr)'], gap: 4, p: 0, listStyle: 'none' }}
      >
        {Object.keys(row).map((label, i) => (
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
                {t(`discovery.table.header.${kebabCase(label)}`)}
              </Box>
            )}
            <DiscoveryTableDataCellContent label={label} row={row} />
          </Box>
        ))}
      </Grid>
    </Box>
  )
}
