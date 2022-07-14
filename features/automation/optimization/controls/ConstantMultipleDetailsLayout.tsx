import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { DetailsSection } from 'components/DetailsSection'
import {
  DetailsSectionContentCard,
  DetailsSectionContentCardWrapper,
} from 'components/DetailsSectionContentCard'
import { AppLink } from 'components/Links'
import { ContentCardTargetColRatio } from 'components/vault/detailsSection/ContentCardTargetColRatio'
import { ContentCardTriggerColRatio } from 'components/vault/detailsSection/ContentCardTriggerColRatio'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { one } from 'helpers/zero'
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
              {/* TODO -ŁW details TBD */}
              <DetailsSectionContentCard title={t('constant-multiple.target-multiple')} />
              <DetailsSectionContentCard title={t('constant-multiple.total-cost-of-feature')} />
              <ContentCardTargetColRatio
                threshold={one}
                token={''}
                // targetColRatio={targetColRatio}
                // afterTargetColRatio={uiState.targetCollRatio}
                // threshold={threshold}
                // changeVariant="positive"
                // token={token}
              />
              {/* TODO - ŁW allow to pass title for ContentCardTriggerColRatio re-use for buy, sell ? */}
              {/* not sure if it makes sense to reuse those components, there are some differences in designs */}
              {/* buy trigger */}
              <ContentCardTriggerColRatio
                token={token}
                //   triggerColRatio={triggerColRatio}
                //   afterTriggerColRatio={uiState.execCollRatio}
                //   nextBuyPrice={nextBuyPrice}
                //   changeVariant="positive"
              />
              {/* sell trigger */}
              <ContentCardTriggerColRatio token={token} />
              <DetailsSectionContentCard title={t('auto-buy.next-buy-prices')} />
              <DetailsSectionContentCard title={t('auto-buy.next-sell-prices')} />
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
              backgroundColor: bannerGradientPresets.autoBuy[0],
              backgroundColorEnd: bannerGradientPresets.autoBuy[1],
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
