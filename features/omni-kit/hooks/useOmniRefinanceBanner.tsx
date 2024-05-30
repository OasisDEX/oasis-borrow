import { OmniRefinanceBanner } from 'features/omni-kit/components/OmniRefinanceBanner'
import React from 'react'

export const useOmniRefinanceBanner = () => {
  return { renderOverviewBanner: () => <OmniRefinanceBanner /> }
}
