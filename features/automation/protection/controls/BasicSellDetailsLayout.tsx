import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardSellTriggerCollRatio } from 'components/vault/detailsSection/ContentCardSellTriggerCollRatio'
import { ContentCardTargetSellColRatio } from 'components/vault/detailsSection/ContentCardTargetSellColRatio'
import { AutoSellTriggerData } from 'features/automation/protection/autoSellTriggerDataExtractor'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BasicSellDetailsLayoutProps {
  token: string
  triggerColRatio: BigNumber
  nextSellPrice: BigNumber
  targetColRatio: BigNumber
  threshold: BigNumber
  autoSellTriggerData: AutoSellTriggerData
}

export function BasicSellDetailsLayout({
  token,
  triggerColRatio,
  nextSellPrice,
  targetColRatio,
  threshold,
  autoSellTriggerData,
}: BasicSellDetailsLayoutProps) {
  const { t } = useTranslation()

  return (
    <DetailsSection
      title={t('auto-sell.title')}
      badge={autoSellTriggerData.isAutoSellEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardSellTriggerCollRatio
            token={token}
            triggerColRatio={triggerColRatio}
            nextSellPrice={nextSellPrice}
          />
          <ContentCardTargetSellColRatio
            token={token}
            targetColRatio={targetColRatio}
            threshold={threshold}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
