import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { MessageCard } from 'components/MessageCard'
import { ContentCardTargetColRatioAfterBuy } from 'components/vault/detailsSection/ContentCardTargetColRatioAfterBuy'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { vaultIdsThatAutoBuyTriggerShouldBeRecreated } from 'features/automation/common/consts'
import { AutoBSTriggerData } from 'features/automation/common/state/autoBSTriggerData'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Text } from 'theme-ui'

export interface AutoBuyDetailsLayoutProps {
  ilk: string
  vaultId: BigNumber
  token: string
  autoBuyTriggerData: AutoBSTriggerData
  triggerColRatio?: BigNumber
  nextBuyPrice?: BigNumber
  targetColRatio?: BigNumber
  threshold?: BigNumber
  afterTriggerColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
  isconstantMultipleEnabled: boolean
}

export function AutoBuyDetailsLayout({
  ilk,
  vaultId,
  token,
  triggerColRatio,
  autoBuyTriggerData,
  nextBuyPrice,
  threshold,
  targetColRatio,
  afterTriggerColRatio,
  afterTargetColRatio,
  isconstantMultipleEnabled,
}: AutoBuyDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const {
    triggerData: {
      autoBuyTriggerData: { isTriggerEnabled, maxBuyOrMinSellPrice },
    },
  } = useAutomationContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isAutoBuyOn = autoBuyTriggerData.isTriggerEnabled

  const shouldShowOverrideAutoBuy =
    isTriggerEnabled &&
    maxBuyOrMinSellPrice.isZero() &&
    vaultIdsThatAutoBuyTriggerShouldBeRecreated.includes(vaultId.toNumber())

  return (
    <>
      {isAutoBuyOn ||
      activeAutomationFeature?.currentOptimizationFeature === AutomationFeatures.AUTO_BUY ? (
        <DetailsSection
          title={t('auto-buy.title')}
          badge={isAutoBuyOn}
          content={
            <>
              {shouldShowOverrideAutoBuy && (
                <Box mb={3}>
                  <MessageCard
                    type="warning"
                    messages={[t('vault-warnings.auto-buy-override')]}
                    withBullet={false}
                  />
                </Box>
              )}
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
            </>
          }
        />
      ) : (
        <Banner
          title={t('auto-buy.banner.header')}
          description={[
            <>
              {t('auto-buy.banner.content')}{' '}
              <AppLink href={EXTERNAL_LINKS.KB.AUTO_BUY_SELL} sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>,
            ...(isconstantMultipleEnabled
              ? [
                  <Text as="span" sx={{ color: 'primary100', fontWeight: 'semiBold' }}>
                    {t('auto-buy.banner.cm-warning')}
                  </Text>,
                ]
              : []),
          ]}
          image={{
            src: '/static/img/setup-banner/auto-buy.svg',
            backgroundColor: bannerGradientPresets.autoBuy[0],
            backgroundColorEnd: bannerGradientPresets.autoBuy[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Optimization',
                currentOptimizationFeature: AutomationFeatures.AUTO_BUY,
              })
              trackingEvents.automation.buttonClick(
                AutomationEventIds.SelectAutoBuy,
                Pages.OptimizationTab,
                CommonAnalyticsSections.Banner,
                { vaultId: vaultId.toString(), ilk },
              )
            },
            text: t('auto-buy.banner.button'),
            disabled: isconstantMultipleEnabled,
          }}
        />
      )}
    </>
  )
}
