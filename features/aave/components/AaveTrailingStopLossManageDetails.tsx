import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { OmniContentCard } from 'features/omni-kit/components/details-section'
import React from 'react'
import { useTranslation } from 'react-i18next'

export const AaveTrailingStopLossManageDetails = () => {
  const { t } = useTranslation()
  return (
    <DetailsSection
      title={t('system.trailing-stop-loss')}
      badge={false}
      content={
        <DetailsSectionContentCardWrapper>
          <OmniContentCard
            title="Trailing Distance"
            value={'TBD'}
            change={['TBD after']}
            changeVariant="positive"
          />
          <OmniContentCard
            title="Current Market Price"
            value={'TBD'}
            footnote={['Next Price: TBD']}
          />
          <OmniContentCard
            title="Trailing Stop Loss Price"
            value={'TBD'}
            change={['TBD after']}
            changeVariant="positive"
          />
          <OmniContentCard
            title="Est. DAI on Trailing Stop Loss triggered"
            value={'TBD'}
            change={['Up to TBD']}
            changeVariant="positive"
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
