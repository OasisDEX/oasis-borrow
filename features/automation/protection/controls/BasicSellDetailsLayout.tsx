import BigNumber from 'bignumber.js'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTargetColRatioAfterSell } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterSell'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BasicSellDetailsLayoutProps {
  token: string
  triggerColRatio: BigNumber
  nextSellPrice: BigNumber
  targetColRatio: BigNumber
  threshold: BigNumber
  basicSellTriggerData: BasicBSTriggerData
}

export function BasicSellDetailsLayout({
  token,
  triggerColRatio,
  nextSellPrice,
  targetColRatio,
  threshold,
  basicSellTriggerData,
}: BasicSellDetailsLayoutProps) {
  const { t } = useTranslation()
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)

  return (
    <DetailsSection
      title={t('auto-sell.title')}
      badge={basicSellTriggerData.isTriggerEnabled}
      content={
        <DetailsSectionContentCardWrapper>
          <ContentCardTriggerColRatioToSell
            token={token}
            triggerColRatio={triggerColRatio}
            afterTriggerColRatio={uiState.execCollRatio}
            nextSellPrice={nextSellPrice}
            changeVariant="positive"
          />
          <ContentCardTargetColRatioAfterSell
            targetColRatio={targetColRatio}
            afterTargetColRatio={uiState.targetCollRatio}
            threshold={threshold}
            changeVariant="positive"
            token={token}
          />
        </DetailsSectionContentCardWrapper>
      }
    />
  )
}
