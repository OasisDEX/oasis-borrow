import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetMultiple } from 'components/vault/detailsSection/ContentCardTargetMultiple'
import { ContentCardTotalCostOfFeature } from 'components/vault/detailsSection/ContentCardTargetMultiple copy'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {
  token: string
}

export function ConstantMultipleDetailsLayout({ token }: ConstantMultipleDetailsLayoutProps) {
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  return (
    <Grid>
      {activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple' ? (
        <DetailsSection
          title={t('constant-multiple.title')}
          // badge={isConstantMultipleOn}
          content={
            <DetailsSectionContentCardWrapper>
              {/* Dummy values */}
              <ContentCardTargetMultiple
                targetMultiple={new BigNumber(2)}
                // aftertargetMultiple={new BigNumber(2.2)}
                targetColRatio={new BigNumber(200)}
                // changeVariant="positive"
              />
              <ContentCardTotalCostOfFeature
                totalCost={new BigNumber(5000)}
                // afterTotalCost={new BigNumber(5040.85)}
                PnLSinceEnabled={new BigNumber(48.25)}
                // changeVariant="positive"
              />
              <ContentCardTriggerColRatioToBuy token={token} />
              <ContentCardTriggerColRatioToSell token={token} />
            </DetailsSectionContentCardWrapper>
          }
        />
      ) : (
        <>
          <Banner
            title={t('constant-multiple.banner.header')}
            description={
              <>
                {t('constant-multiple.banner.content')}{' '}
                <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 2 }}>
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
                  currentOptimizationFeature: 'constantMultiple',
                })
              },
              text: t('constant-multiple.banner.button'),
            }}
          />
        </>
      )}
    </Grid>
  )
}
