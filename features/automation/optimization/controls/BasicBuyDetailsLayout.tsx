import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetColRatioAfterBuy } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterBuy'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
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
  afterTriggerColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
}

export function BasicBuyDetailsLayout({
  token,
  triggerColRatio,
  basicBuyTriggerData,
  nextBuyPrice,
  threshold,
  targetColRatio,
  afterTriggerColRatio,
  afterTargetColRatio,
}: BasicBuyDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isAutoBuyOn = basicBuyTriggerData.isTriggerEnabled

  return (
    <Grid>
      {isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy' ? (
        <DetailsSection
          title={t('auto-buy.title')}
          badge={isAutoBuyOn}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTriggerColRatioToBuy
                token={token}
                triggerColRatio={triggerColRatio}
                afterTriggerColRatio={afterTriggerColRatio}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTargetColRatioAfterBuy
                targetColRatio={targetColRatio}
                afterTargetColRatio={afterTargetColRatio}
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
