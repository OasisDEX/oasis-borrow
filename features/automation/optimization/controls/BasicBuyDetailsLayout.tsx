import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetColRatio } from 'components/vault/detailsSection/ContentCardTargetColRatio'
import { ContentCardTriggerColRatio } from 'components/vault/detailsSection/ContentCardTriggerColRatio'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  BASIC_BUY_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface BasicBuyDetailsLayoutProps {
  token: string
  triggerColRatio: BigNumber
  nextBuyPrice: BigNumber
  targetColRatio: BigNumber
  threshold: BigNumber
  basicBuyTriggerData: BasicBSTriggerData
}

export function BasicBuyDetailsLayout({
  token,
  triggerColRatio,
  basicBuyTriggerData,
  nextBuyPrice,
  threshold,
  targetColRatio,
}: BasicBuyDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isAutoBuyOn = basicBuyTriggerData.isTriggerEnabled
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_BUY_FORM_CHANGE)

  return (
    <Grid>
      {isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy' ? (
        <DetailsSection
          title={t('auto-buy.title')}
          badge={isAutoBuyOn}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTriggerColRatio
                token={token}
                triggerColRatio={triggerColRatio}
                afterTriggerColRatio={uiState.execCollRatio}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTargetColRatio
                targetColRatio={targetColRatio}
                afterTargetColRatio={uiState.targetCollRatio}
                threshold={threshold}
                changeVariant="positive"
                token={token}
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <Banner
          title={t('auto-buy.banner.header')}
          description={
            <>
              {t('auto-buy.banner.content')}{' '}
              <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>
          }
          image={{
            src: '/static/img/setup-banner/auto-buy.svg',
            backgroundColor: bannerGradientPresets.autoBuy[0],
            backgroundColorEnd: bannerGradientPresets.autoBuy[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Optimization',
                currentOptimizationFeature: 'autoBuy',
              })
            },
            text: t('auto-buy.banner.button'),
          }}
        />
      )}
    </Grid>
  )
}
