import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTriggerColPrice } from 'components/vault/detailsSection/ContentCardTriggerColPrice'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface AutoTakeProfitDetailsLayoutProps {
  isTriggerEnabled: boolean
  triggerColPrice?: BigNumber
  estimatedProfit?: BigNumber
  afterTriggerColPrice?: BigNumber
  token: string
}

export function AutoTakeProfitDetailsLayout({
  isTriggerEnabled,
  triggerColPrice,
  estimatedProfit,
  afterTriggerColPrice,
  token,
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
                afterTriggerColPrice={estimatedProfit}
                estimatedProfit={afterTriggerColPrice}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <Banner
          title={t('auto-take-profit.banner.header')}
          description={t('auto-take-profit.banner.content')}
          image={{
            src: '/static/img/setup-banner/auto-buy.svg',
            backgroundColor: bannerGradientPresets.autoTakeProfit[0],
            backgroundColorEnd: bannerGradientPresets.autoTakeProfit[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Optimization',
                currentOptimizationFeature: 'autoTakeProfit',
              })
            },
            text: t('auto-take-profit.banner.button'),
          }}
        />
      )}
    </Grid>
  )
}
