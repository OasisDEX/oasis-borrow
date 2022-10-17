import { DiscoveryTableBanner } from 'features/discovery/common/DiscoveryTableBanner'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages, DiscoveryTableRowData } from 'features/discovery/types'
import { useTranslation } from 'next-i18next'
import { Fragment } from 'react'
import { Box } from 'theme-ui'

export function DiscoveryCards({
  banner,
  // isLoading,
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
      as="ul"
      sx={{
        px: ['24px', null, null, 4],
        listStyle: 'none',
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
    </Box>
  )
}

export function DiscoveryCard({ row }: { row: DiscoveryTableRowData }) {
  return (
    <Box as="li">
      {Object.keys(row).map((label, i) => (
        <Box key={i}>{label}</Box>
      ))}
    </Box>
  )
}
