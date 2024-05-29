import { OmniRefinanceBanner } from 'features/omni-kit/components'
import React from 'react'

export const useOmniRefinanceBanner = () => {
  return { renderOverviewBanner: () => <OmniRefinanceBanner /> }
}
