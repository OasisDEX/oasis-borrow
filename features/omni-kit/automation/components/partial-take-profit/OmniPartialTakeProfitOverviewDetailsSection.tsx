import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { OmniPartialTakeProfitOverviewDetailsSectionFooter } from 'features/omni-kit/automation/components'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniPartialTakeProfitDataHandler } from 'features/omni-kit/automation/hooks'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import type { OmniProductType } from 'features/omni-kit/types'
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
    environment: { priceFormat, productType },
  } = useOmniGeneralContext()
  const {
    position: {
      currentPosition: {
        position: {
          liquidationPrice,
          riskRatio: { loanToValue, multiple },
        },
      },
    },
  } = useOmniProductContext(productType as OmniProductType.Borrow | OmniProductType.Multiply)

  const {
    chartView,
    currentProfitAndLossCommonData,
    estimatedToReceiveCommonData,
    isLoading,
    isPartialTakeProfitEnabled,
    isSimpleView,
    nextDynamicTriggerPriceCommonData,
    realizedProfitCommonData,
    setChartView,
  } = useOmniPartialTakeProfitDataHandler()

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('system.partial-take-profit')}
      badge={isPartialTakeProfitEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...nextDynamicTriggerPriceCommonData} isLoading={isLoading} />
          <OmniContentCard {...estimatedToReceiveCommonData} isLoading={isLoading} />
          <OmniContentCard {...currentProfitAndLossCommonData} />
          <OmniContentCard {...realizedProfitCommonData} />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <OmniPartialTakeProfitOverviewDetailsSectionFooter
          chartView={chartView}
          liquidationPrice={liquidationPrice}
          loanToValue={loanToValue}
          multiple={multiple}
          priceFormat={priceFormat}
          setChartView={setChartView}
          simpleView={isSimpleView}
        />
      }
    />
  )
}
