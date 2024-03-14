import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { OmniPartialTakeProfitOverviewDetailsSectionFooter } from 'features/omni-kit/automation/components'
import { resolveActiveOrder } from 'features/omni-kit/automation/helpers'
import { useOmniPartialTakeProfitDataHandler } from 'features/omni-kit/automation/helpers/useOmniPartialTakeProfitDataHandler'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import { useOmniGeneralContext } from 'features/omni-kit/contexts'
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
    environment: { priceFormat },
  } = useOmniGeneralContext()

  const {
    isPartialTakeProfitEnabled,
    currentProfitAndLossCommonData,
    realizedProfitCommonData,
    liquidationPrice,
    loanToValue,
    multiple,
    simpleView,
    chartView,
    setChartView,
  } = useOmniPartialTakeProfitDataHandler()

  return (
    <DetailsSection
      sx={resolveActiveOrder(active)}
      title={t('system.partial-take-profit')}
      badge={isPartialTakeProfitEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard {...currentProfitAndLossCommonData} />
          <OmniContentCard {...realizedProfitCommonData} />
        </DetailsSectionContentCardWrapper>
      }
      footer={
        <OmniPartialTakeProfitOverviewDetailsSectionFooter
          liquidationPrice={liquidationPrice}
          loanToValue={loanToValue}
          multiple={multiple}
          priceFormat={priceFormat}
          simpleView={simpleView}
          chartView={chartView}
          setChartView={setChartView}
        />
      }
    />
  )
}
