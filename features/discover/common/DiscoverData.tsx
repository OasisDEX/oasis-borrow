import { AssetsResponsiveTable } from 'components/assetsTable/AssetsResponsiveTable'
import { AssetsTableBannerProps, AssetsTableRowData } from 'components/assetsTable/types'
import { DiscoverDataResponseError } from 'features/discover/api'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { useAccount } from 'helpers/useAccount'
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
  const { chainId, walletAddress } = useAccount()

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
            {...(!!chainId &&
              !!walletAddress && {
                isWithFollow: true,
              })}
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
