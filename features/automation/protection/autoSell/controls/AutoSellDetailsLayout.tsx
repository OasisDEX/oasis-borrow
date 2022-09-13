import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTargetColRatioAfterSell } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterSell'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AutoSellDetailsLayoutProps {
  token: string
  autoSellTriggerData: AutoBSTriggerData
  triggerColRatio?: BigNumber
  nextSellPrice?: BigNumber
  targetColRatio?: BigNumber
  threshold?: BigNumber
  afterTriggerColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
}

export function AutoSellDetailsLayout({
  token,
  triggerColRatio,
  nextSellPrice,
  targetColRatio,
  threshold,
  autoSellTriggerData,
  afterTriggerColRatio,
  afterTargetColRatio,
}: AutoSellDetailsLayoutProps) {
  const { t } = useTranslation()

  return (
    <DetailsSection
      title={t('auto-sell.title')}
      badge={autoSellTriggerData.isTriggerEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTriggerColRatioToSell
            token={token}
            triggerColRatio={triggerColRatio}
            afterTriggerColRatio={afterTriggerColRatio}
            nextSellPrice={nextSellPrice}
            changeVariant="positive"
          />
          <ContentCardTargetColRatioAfterSell
            targetColRatio={targetColRatio}
            afterTargetColRatio={afterTargetColRatio}
            threshold={threshold}
            changeVariant="positive"
            token={token}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
