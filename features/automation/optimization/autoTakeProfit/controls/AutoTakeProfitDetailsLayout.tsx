import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTriggerColPrice } from 'components/vault/detailsSection/ContentCardTriggerColPrice'
import { ContentCardTriggerColRatio } from 'components/vault/detailsSection/ContentCardTriggerColRatio'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface AutoTakeProfitDetailsLayoutProps {
  ilk: string
  vaultId: BigNumber
  afterTriggerColPrice?: BigNumber
  afterTriggerColRatio?: BigNumber
  currentColRatio: BigNumber
  estimatedProfit?: BigNumber
  isTriggerEnabled: boolean
  token: string
  triggerColPrice?: BigNumber
  triggerColRatio?: BigNumber
}

export function AutoTakeProfitDetailsLayout({
  ilk,
  vaultId,
  afterTriggerColPrice,
  afterTriggerColRatio,
  currentColRatio,
  estimatedProfit,
  isTriggerEnabled,
  token,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitDetailsLayoutProps) {
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  return (
    <Grid>
      {isTriggerEnabled ||
      activeAutomationFeature?.currentOptimizationFeature === 'autoTakeProfit' ? (
        <DetailsSection
          title={t('auto-take-profit.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTriggerColPrice
                token={token}
                triggerColPrice={triggerColPrice}
                afterTriggerColPrice={afterTriggerColPrice}
                estimatedProfit={estimatedProfit}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatio
                triggerColRatio={triggerColRatio}
                afterTriggerColRatio={afterTriggerColRatio}
                currentColRatio={currentColRatio}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <Banner
          title={t('auto-take-profit.banner.header')}
          description={
            <>
              {t('auto-take-profit.banner.content')}{' '}
              <AppLink href={EXTERNAL_LINKS.KB.TAKE_PROFIT} sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>
          }
          image={{
            src: '/static/img/setup-banner/auto-take-profit.svg',
            backgroundColor: bannerGradientPresets.autoTakeProfit[0],
            backgroundColorEnd: bannerGradientPresets.autoTakeProfit[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Optimization',
                currentOptimizationFeature: AutomationFeatures.AUTO_TAKE_PROFIT,
              })
              trackingEvents.automation.buttonClick(
                AutomationEventIds.SelectTakeProfit,
                Pages.OptimizationTab,
                CommonAnalyticsSections.Banner,
                { vaultId: vaultId.toString(), ilk },
              )
            },
            text: t('auto-take-profit.banner.button'),
          }}
        />
      )}
    </Grid>
  )
}
