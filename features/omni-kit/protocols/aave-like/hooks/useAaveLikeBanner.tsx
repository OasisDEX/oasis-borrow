import { OverviewBanner } from 'features/omni-kit/protocols/aave-like/components/banners/AaveLikeOverviewBanner'
import React from 'react'

export const useAaveLikeBanner = () => {
  return { renderOverviewBanner: () => <OverviewBanner /> }
}
