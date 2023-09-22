import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import type { AssetsTableBannerProps, AssetsTableRowData } from 'components/assetsTable/types'
import type { DiscoverDataResponseError } from 'features/discover/api'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import React from 'react'
import { Box } from 'theme-ui'

interface DiscoverDataProps {
  banner?: AssetsTableBannerProps
  error?: DiscoverDataResponseError
  isLoading: boolean
  isSticky: boolean
  rows?: AssetsTableRowData[]
}

export function DiscoverData({ banner, error, isLoading, isSticky, rows }: DiscoverDataProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {rows ? (
        <>
          {isLoading && <DiscoverPreloader isContentLoaded />}
          <AssetsResponsiveTable
            banner={banner}
            isLoading={isLoading}
            isSticky={isSticky}
            rows={rows}
          />
        </>
      ) : isLoading ? (
        <DiscoverPreloader />
      ) : (
        <DiscoverError error={error} />
      )}
    </Box>
  )
}
