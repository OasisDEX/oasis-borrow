import { MixpanelUserContext } from 'analytics/analytics'
import { DiscoverDataResponse } from 'features/discover/api'
import { DiscoverCards } from 'features/discover/common/DiscoverCards'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'
import { theme } from 'theme'
import { Box } from 'theme-ui'
import { useMediaQuery } from 'usehooks-ts'

interface DiscoverDataProps {
  banner?: DiscoverBanner
  response?: DiscoverDataResponse
  isLoading: boolean
  kind: DiscoverPages
  userContext: MixpanelUserContext
}

export function DiscoverData({
  banner,
  isLoading,
  kind,
  response,
  userContext,
}: DiscoverDataProps) {
  const isSmallerScreen = useMediaQuery(`(max-width: ${theme.breakpoints[2]})`)

  return (
    <Box sx={{ position: 'relative' }}>
      {response?.data?.rows && response?.data?.rows.length > 0 ? (
        <>
          {isLoading && <DiscoverPreloader isContentLoaded={true} />}
          {isSmallerScreen ? (
            <DiscoverCards
              banner={banner}
              isLoading={isLoading}
              kind={kind}
              rows={response.data.rows}
              userContext={userContext}
            />
          ) : (
            <DiscoverTable
              banner={banner}
              isLoading={isLoading}
              kind={kind}
              rows={response.data.rows}
              userContext={userContext}
            />
          )}
        </>
      ) : isLoading ? (
        <DiscoverPreloader isContentLoaded={false} />
      ) : (
        <DiscoverError />
      )}
    </Box>
  )
}
