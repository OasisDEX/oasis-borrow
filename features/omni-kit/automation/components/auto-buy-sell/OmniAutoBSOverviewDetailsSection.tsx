import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import type { OmniAutoBSAutomationTypes } from 'features/omni-kit/automation/components/auto-buy-sell/types'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniAutoBSDataHandler } from 'features/omni-kit/automation/hooks'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import type { FC } from 'react'
import React from 'react'

interface OmniAutoBSOverviewDetailsSectionProps {
  type: OmniAutoBSAutomationTypes
  active?: boolean
}

export const OmniAutoBSOverviewDetailsSection: FC<OmniAutoBSOverviewDetailsSectionProps> = ({
  type,
  active,
}) => {
  const {
    resolvedTitle,
    resolvedFlag,
    autoBSTriggerExecutionLtvContentCardCommonData,
    autoBSTriggerTargetLtvContentCardCommonData,
  } = useOmniAutoBSDataHandler({ type })

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={resolvedTitle}
      badge={resolvedFlag}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...autoBSTriggerExecutionLtvContentCardCommonData} />
          <OmniContentCard {...autoBSTriggerTargetLtvContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
