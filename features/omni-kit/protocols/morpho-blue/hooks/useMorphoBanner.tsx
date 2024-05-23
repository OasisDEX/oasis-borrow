import { OverviewBanner } from 'features/omni-kit/protocols/morpho-blue/components/banners/MorphoOverviewBanner'
import React from 'react'

export const useMorphoBanner = () => {
  return { renderOverviewBanner: () => <OverviewBanner /> }
}
