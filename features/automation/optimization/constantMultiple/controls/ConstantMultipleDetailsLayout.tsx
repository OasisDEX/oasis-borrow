import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { useAutomationContext } from 'components/context'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardOperatingCost } from 'components/vault/detailsSection/ContentCardOperatingCost'
import { ContentCardTargetMultiple } from 'components/vault/detailsSection/ContentCardTargetMultiple'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import type { AutomationChangeFeature } from 'features/automation/common/state/automationFeatureChange.types'
import { AutomationFeatures } from 'features/automation/common/types'
import { VaultType } from 'features/generalManageVault/vaultType.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {
  ilk: string
  vaultId: BigNumber
  token: string
  isTriggerEnabled: boolean
  targetMultiple?: BigNumber
  targetColRatio?: BigNumber
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
  triggerColRatioToBuy?: BigNumber
  nextBuyPrice?: BigNumber
  triggerColRatioToSell?: BigNumber
  nextSellPrice?: BigNumber
  afterTargetMultiple?: number
  triggerColRatioToBuyToBuy?: BigNumber
  afterTriggerColRatioToSell?: BigNumber
}

export function ConstantMultipleDetailsLayout({
  ilk,
  vaultId,
  token,
  isTriggerEnabled,
  targetMultiple,
  targetColRatio,
  totalCost,
  PnLSinceEnabled,
  triggerColRatioToBuy,
  nextBuyPrice,
  triggerColRatioToSell,
  nextSellPrice,
  afterTargetMultiple,
  triggerColRatioToBuyToBuy,
  afterTriggerColRatioToSell,
}: ConstantMultipleDetailsLayoutProps) {
  const { t } = useTranslation()
  const {
    positionData: { vaultType },
  } = useAutomationContext()
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const isMultiplyVault = vaultType === VaultType.Multiply

  return (
    <Grid>
      {isTriggerEnabled ||
      activeAutomationFeature?.currentOptimizationFeature ===
        AutomationFeatures.CONSTANT_MULTIPLE ? (
        <DetailsSection
          title={t('constant-multiple.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTargetMultiple
                targetMultiple={targetMultiple}
                afterTargetMultiple={afterTargetMultiple}
                targetColRatio={targetColRatio}
                changeVariant="positive"
              />
              <ContentCardOperatingCost totalCost={totalCost} PnLSinceEnabled={PnLSinceEnabled} />
              <ContentCardTriggerColRatioToBuy
                token={token}
                triggerColRatio={triggerColRatioToBuy}
                afterTriggerColRatio={triggerColRatioToBuyToBuy}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatioToSell
                token={token}
                triggerColRatio={triggerColRatioToSell}
                afterTriggerColRatio={afterTriggerColRatioToSell}
                nextSellPrice={nextSellPrice}
                changeVariant="positive"
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <>
          {isMultiplyVault && (
            <Banner
              title={t('constant-multiple.banner.header')}
              description={
                <>
                  {t('constant-multiple.banner.content')}{' '}
                  <AppLink href={EXTERNAL_LINKS.KB.WHAT_IS_CONSTANT_MULTIPLE} sx={{ fontSize: 2 }}>
                    {t('here')}.
                  </AppLink>
                </>
              }
              image={{
                src: '/static/img/setup-banner/constant-multiply.svg',
                backgroundColor: bannerGradientPresets.constantMultiply[0],
                backgroundColorEnd: bannerGradientPresets.constantMultiply[1],
              }}
              button={{
                action: () => {
                  uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                    type: 'Optimization',
                    currentOptimizationFeature: AutomationFeatures.CONSTANT_MULTIPLE,
                  })
                  trackingEvents.automation.buttonClick(
                    MixpanelAutomationEventIds.SelectConstantMultiple,
                    MixpanelPages.OptimizationTab,
                    MixpanelCommonAnalyticsSections.Banner,
                    { vaultId: vaultId.toString(), ilk },
                  )
                },
                text: t('constant-multiple.banner.button'),
              }}
            />
          )}
        </>
      )}
    </Grid>
  )
}
