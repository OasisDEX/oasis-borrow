import { MixpanelUserContext, trackingEvents } from 'analytics/analytics'
import { NetworkIds } from 'blockchain/networkIds'
import { DiscoverDataResponse } from 'features/discover/api'
import { DiscoverError } from 'features/discover/common/DiscoverError'
import { DiscoverPreloader } from 'features/discover/common/DiscoverPreloader'
import { DiscoverResponsiveTable } from 'features/discover/common/DiscoverResponsiveTable'
import { DiscoverBanner } from 'features/discover/meta'
import { DiscoverPages } from 'features/discover/types'
import { useAccount } from 'helpers/useAccount'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import React from 'react'
import { Box } from 'theme-ui'

interface DiscoverDataProps {
  banner?: DiscoverBanner
  isLoading: boolean
  isSticky: boolean
  kind: DiscoverPages
  response?: DiscoverDataResponse
  userContext: MixpanelUserContext
}

export function DiscoverData({
  banner,
  isLoading,
  isSticky,
  kind,
  response,
  userContext,
}: DiscoverDataProps) {
  const followVaultsEnabled = useFeatureToggle('FollowVaults')
  const { walletAddress } = useAccount()

  return (
    <Box sx={{ position: 'relative' }}>
      {response?.rows ? (
        <>
          {isLoading && <DiscoverPreloader isContentLoaded />}
          <DiscoverResponsiveTable
            banner={banner}
            isLoading={isLoading}
            isSticky={isSticky}
            kind={kind}
            rows={response.rows}
            {...(followVaultsEnabled &&
              !!walletAddress && {
                follow: {
                  followerAddress: walletAddress,
                  chainId: NetworkIds.MAINNET,
                },
              })}
            onBannerClick={(link) => {
              trackingEvents.discover.clickedTableBanner(kind, link, userContext)
            }}
            onPositionClick={(cdpId) => {
              trackingEvents.discover.viewPosition(kind, cdpId)
            }}
          />
        </>
      ) : isLoading ? (
        <DiscoverPreloader />
      ) : (
        <DiscoverError error={response?.error} />
      )}
    </Box>
  )
}
