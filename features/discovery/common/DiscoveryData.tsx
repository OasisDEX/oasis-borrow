import { DiscoveryDataResponse } from 'features/discovery/api'
import { DiscoveryCards } from 'features/discovery/common/DiscoveryCards'
import { DiscoveryError } from 'features/discovery/common/DiscoveryError'
import { DiscoveryPreloader } from 'features/discovery/common/DiscoveryPreloader'
import { DiscoveryTable } from 'features/discovery/common/DiscoveryTable'
import { DiscoveryBanner } from 'features/discovery/meta'
import { DiscoveryPages } from 'features/discovery/types'
import React from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface DiscoveryDataProps {
  banner?: DiscoveryBanner
  response?: DiscoveryDataResponse
  isLoading: boolean
  kind: DiscoveryPages
}

export function DiscoveryData({ banner, response, isLoading, kind }: DiscoveryDataProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <Box sx={{ position: 'relative' }}>
      {response?.data?.rows && response?.data?.rows.length > 0 ? (
        <>
          {isLoading && <DiscoveryPreloader isContentLoaded={true} />}
          {isSmallerScreen ? (
            <DiscoveryCards
              banner={banner}
              isLoading={isLoading}
              kind={kind}
              rows={response.data.rows}
            />
          ) : (
            <DiscoveryTable
              banner={banner}
              isLoading={isLoading}
              kind={kind}
              rows={response.data.rows}
            />
          )}
        </>
      ) : isLoading ? (
        <DiscoveryPreloader isContentLoaded={false} />
      ) : (
        <DiscoveryError />
      )}
    </Box>
  )
}
