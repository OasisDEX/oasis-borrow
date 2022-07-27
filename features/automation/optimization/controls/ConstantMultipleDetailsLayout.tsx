import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetMultiple } from 'components/vault/detailsSection/ContentCardTargetMultiple'
import { ContentCardTotalCostOfFeature } from 'components/vault/detailsSection/ContentCardTotalCostOfFeature'
import { ContentCardTriggerColRatioToBuy } from 'components/vault/detailsSection/ContentCardTriggerColRatioToBuy'
import { ContentCardTriggerColRatioToSell } from 'components/vault/detailsSection/ContentCardTriggerColRatioToSell'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import {
  CONSTANT_MULTIPLE_FORM_CHANGE,
  ConstantMultipleFormChange,
} from 'features/automation/protection/common/UITypes/constantMultipleFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {
  token: string
  isTriggerEnabled: boolean
  targetMultiple: BigNumber
  targetColRatio?: BigNumber
  totalCost: BigNumber
  PnLSinceEnabled?: BigNumber
  triggerColRatioToBuy: BigNumber
  nextBuyPrice?: BigNumber
  triggerColRatioToSell: BigNumber
  nextSellPrice?: BigNumber
}

export function ConstantMultipleDetailsLayout({
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
}: ConstantMultipleDetailsLayoutProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const [uiState] = useUIChanges<ConstantMultipleFormChange>(CONSTANT_MULTIPLE_FORM_CHANGE)

  return (
    <Grid>
      {activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple' ? (
        <DetailsSection
          title={t('constant-multiple.title')}
          badge={isTriggerEnabled}
          content={
            <DetailsSectionContentCardWrapper>
              <ContentCardTargetMultiple
                targetMultiple={targetMultiple}
                afterTargetMultiple={uiState.multiplier}
                targetColRatio={targetColRatio}
                changeVariant="positive"
              />
              <ContentCardTotalCostOfFeature
                totalCost={totalCost}
                PnLSinceEnabled={PnLSinceEnabled}
              />
              <ContentCardTriggerColRatioToBuy
                token={token}
                triggerColRatio={triggerColRatioToBuy}
                afterTriggerColRatio={uiState.buyExecutionCollRatio}
                nextBuyPrice={nextBuyPrice}
                changeVariant="positive"
              />
              <ContentCardTriggerColRatioToSell
                token={token}
                triggerColRatio={triggerColRatioToSell}
                afterTriggerColRatio={uiState.sellExecutionCollRatio}
                nextSellPrice={nextSellPrice}
                changeVariant="positive"
              />
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
