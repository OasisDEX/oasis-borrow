import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetColRatioAfterSell } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterSell'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AutoSellDetailsLayoutProps {
  triggerColRatio?: BigNumber
  nextSellPrice?: BigNumber
  targetColRatio?: BigNumber
  threshold?: BigNumber
  afterTriggerColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
}

export function AutoSellDetailsLayout({
  triggerColRatio,
  nextSellPrice,
  targetColRatio,
  threshold,
  afterTriggerColRatio,
  afterTargetColRatio,
}: AutoSellDetailsLayoutProps) {
  const { t } = useTranslation()
  const {
    positionData: { id, ilk, token },
    triggerData: { autoSellTriggerData },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isAutoSellOn = autoSellTriggerData.isTriggerEnabled

  return (
    <>
      {isAutoSellOn ||
      activeAutomationFeature?.currentProtectionFeature === AutomationFeatures.AUTO_SELL ? (
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
      ) : (
        <Banner
          title={t('auto-sell.banner.header')}
          description={[
            <>
              {t('auto-sell.banner.content')}{' '}
              <AppLink href={EXTERNAL_LINKS.KB.AUTO_BUY_SELL} sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>,
          ]}
          image={{
            src: '/static/img/setup-banner/auto-sell.svg',
            backgroundColor: bannerGradientPresets.autoSell[0],
            backgroundColorEnd: bannerGradientPresets.autoSell[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: AutomationFeatures.AUTO_SELL,
              })
              trackingEvents.automation.buttonClick(
                MixpanelAutomationEventIds.SelectAutoSell,
                MixpanelPages.ProtectionTab,
                MixpanelCommonAnalyticsSections.Banner,
                { vaultId: id.toString(), ilk },
              )
            },
            text: t('auto-sell.banner.button'),
            disabled: false,
          }}
        />
      )}
    </>
  )
}
