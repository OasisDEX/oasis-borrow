import BigNumber from 'bignumber.js'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { ContentCardTargetColRatio } from 'components/vault/detailsSection/ContentCardTargetColRatio'
import { ContentCardTriggerColRatio } from 'components/vault/detailsSection/ContentCardTriggerColRatio'
import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface OptimizationDetailsLayoutProps {
  isAutoBuyOn: boolean
  vault: Vault
}

export function OptimizationDetailsLayout({ isAutoBuyOn, vault }: OptimizationDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useObservable(
    uiChanges.subscribe<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE),
  )

  const { token } = vault

  return (
    <Grid>
      {isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy' ? (
        <DetailsSection
          title={t('auto-buy.title')}
          badge={false}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTriggerColRatio
                token={token}
                triggerColRatio={new BigNumber(Math.random() * 100)}
                nextBuyPrice={new BigNumber(Math.random() * 1000)}
              />
              <ContentCardTargetColRatio
                token={token}
                targetColRatio={new BigNumber(Math.random() * 100)}
                threshold={new BigNumber(Math.random() * 1000)}
              />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <SetupBanner
          header={t('auto-buy.banner.header')}
          content={t('auto-buy.banner.content')}
          button={t('auto-buy.banner.button')}
          backgroundImage="/static/img/setup-banner/auto-buy.svg"
          backgroundColor={setupBannerGradientPresets.autoBuy[0]}
          backgroundColorEnd={setupBannerGradientPresets.autoBuy[1]}
          handleClick={() => {
            uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
              type: 'Optimization',
              currentOptimizationFeature: 'autoBuy',
            })
          }}
        />
      )}
    </Grid>
  )
}
