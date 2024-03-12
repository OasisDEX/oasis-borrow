import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { useTranslation } from 'next-i18next'
import type { FC } from 'react'
import React from 'react'

interface OmniPartialTakeProfitOverviewDetailsSectionProps {
  active?: boolean
}

export const OmniPartialTakeProfitOverviewDetailsSection: FC<
  OmniPartialTakeProfitOverviewDetailsSectionProps
> = ({ active = false }) => {
  const { t } = useTranslation()

  const {
    environment: { productType, settings, networkId },
  } = useOmniGeneralContext()
  const {
    dynamicMetadata: {
      values: { automation },
    },
    automation: {
      automationForm: { state, updateState },
    },
  } = useOmniProductContext(productType)

  const isPartialTakeProfitEnabled = !!automation?.flags.isPartialTakeProfitEnabled
  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('partial-take-profit.title')}
      badge={isPartialTakeProfitEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          PTP
          {/*<OmniContentCard {...stopLossLtvContentCardCommonData} />*/}
          {/*<OmniContentCard {...ltvContentCardCommonData} />*/}
          {/*<OmniContentCard {...dynamicStopPriceContentCardCommonData} />*/}
          {/*<OmniContentCard {...estTokenOnTriggerContentCardCommonData} />*/}
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
