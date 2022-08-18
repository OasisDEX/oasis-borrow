import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTargetColRatioAfterSell } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterSell'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BasicSellDetailsLayoutProps {
  token: string
  triggerColRatio: BigNumber
  nextSellPrice: BigNumber
  targetColRatio: BigNumber
  threshold: BigNumber
  basicSellTriggerData: BasicBSTriggerData
  afterTriggerColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
}

export function BasicSellDetailsLayout({
  token,
  triggerColRatio,
  nextSellPrice,
  targetColRatio,
  threshold,
  basicSellTriggerData,
  afterTriggerColRatio,
  afterTargetColRatio,
}: BasicSellDetailsLayoutProps) {
  const { t } = useTranslation()

  return (
    <DetailsSection
      title={t('auto-sell.title')}
      badge={basicSellTriggerData.isTriggerEnabled}
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
