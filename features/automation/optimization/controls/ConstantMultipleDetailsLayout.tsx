import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { AppLink } from 'components/Links'
import {
  AutomationChangeFeature,
  AUTOMATION_CHANGE_FEATURE,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

export interface ConstantMultipleDetailsLayoutProps {}

export function ConstantMultipleDetailsLayout({}: ConstantMultipleDetailsLayoutProps) {
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  return (
    <Grid>
      {activeAutomationFeature?.currentOptimizationFeature === 'constantMultiple' ? (
        <>details section tbd</>
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
