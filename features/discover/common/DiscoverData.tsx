import { MixpanelUserContext } from 'analytics/analytics'
import { DiscoverDataResponse } from 'features/discover/api'
import { DiscoverCards } from 'features/discover/common/DiscoverCards'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverTable } from 'features/discover/common/DiscoverTable'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import React from 'react'
import { Box } from 'theme-ui'

interface DiscoverDataProps {
  banner?: DiscoverBanner
  isLoading: boolean
  isSticky: boolean
  isSmallerScreen: boolean
  kind: DiscoverPages
  response?: DiscoverDataResponse
  userContext: MixpanelUserContext
}

export function DiscoverData({
  banner,
  isLoading,
  isSticky,
  isSmallerScreen,
  kind,
  response,
  userContext,
}: DiscoverDataProps) {
  return (
    <Box sx={{ position: 'relative' }}>
      {response?.rows ? (
        <>
          {isLoading && <DiscoverPreloader isContentLoaded={true} />}
          {isSmallerScreen ? (
            <DiscoverCards
              banner={banner}
              isLoading={isLoading}
              kind={kind}
              rows={response.rows}
              userContext={userContext}
            />
          ) : (
            <DiscoverTable
              banner={banner}
              isLoading={isLoading}
              isSticky={isSticky}
              kind={kind}
              rows={response.rows}
              userContext={userContext}
            />
          )}
        </>
      ) : isLoading ? (
        <DiscoverPreloader isContentLoaded={false} />
      ) : (
        <DiscoverError error={response?.error} />
      )}
    </Box>
  )
}
