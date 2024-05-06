import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { OmniTrailingStopLossOverviewDetailsSectionFooter } from 'features/omni-kit/automation/components'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniTrailingStopLossDataHandler } from 'features/omni-kit/automation/hooks'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniTrailingStopLossOverviewDetailsSectionProps {
  active?: boolean
}

export const OmniTrailingStopLossOverviewDetailsSection: FC<
  OmniTrailingStopLossOverviewDetailsSectionProps
> = ({ active = false }) => {
  const { t } = useTranslation()
  const {
    environment: { productType },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
  } = useOmniProductContext(productType)

  const {
    currentMarketPriceContentCardCommonData,
    dynamicStopPriceContentCardCommonData,
    estTokenOnTriggerContentCardCommonData,
    isSimpleView,
    trailingDistanceContentCardCommonData,
  } = useOmniTrailingStopLossDataHandler()

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('system.trailing-stop-loss')}
      badge={!!automation?.flags.isTrailingStopLossEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...trailingDistanceContentCardCommonData} />
          <OmniContentCard {...currentMarketPriceContentCardCommonData} />
          <OmniContentCard {...dynamicStopPriceContentCardCommonData} />
          <OmniContentCard {...estTokenOnTriggerContentCardCommonData} />
        </DetailsSectionContentCardWrapper>
      }
      footer={!isSimpleView && <OmniTrailingStopLossOverviewDetailsSectionFooter />}
    />
  )
}
