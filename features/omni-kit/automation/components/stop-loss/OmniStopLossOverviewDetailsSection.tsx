import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniStopLossDataHandler } from 'features/omni-kit/automation/hooks'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniStopLossOverviewDetailsSectionProps {
  active?: boolean
}

export const OmniStopLossOverviewDetailsSection: FC<OmniStopLossOverviewDetailsSectionProps> = ({
  active = false,
}) => {
  const { t } = useTranslation()

  const {
    isStopLossEnabled,
    stopLossLtvContentCardCommonData,
    ltvContentCardCommonData,
    dynamicStopPriceContentCardCommonData,
    estTokenOnTriggerContentCardCommonData,
  } = useOmniStopLossDataHandler()

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('system.stop-loss')}
      badge={isStopLossEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...stopLossLtvContentCardCommonData} />
          <OmniContentCard {...ltvContentCardCommonData} />
          <OmniContentCard {...dynamicStopPriceContentCardCommonData} />
          <OmniContentCard {...estTokenOnTriggerContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
