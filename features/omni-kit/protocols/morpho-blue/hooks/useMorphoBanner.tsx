import { useOmniRefinanceContext } from 'features/omni-kit/contexts/OmniRefinanceContext'
import { RefinanceBanner } from 'features/refinance/components'
import { useAppConfig } from 'helpers/config'
import React from 'react'

export const useMorphoBanner = () => {
  return { renderOverviewBanner: () => <OverviewBanner /> }
}

const OverviewBanner = () => {
  const omniRefinance = useOmniRefinanceContext()
  const { EnableRefinance: refinanceEnabled } = useAppConfig('features')

  if (!refinanceEnabled || omniRefinance.refinanceContextInput == null) {
    return null
  }

  return <RefinanceBanner contextInput={omniRefinance.refinanceContextInput} />
}
