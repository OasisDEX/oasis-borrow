import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import { AutoSellTriggerData } from 'features/automation/protection/autoSellTriggerDataExtractor'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicSellDetailsLayout } from 'features/automation/protection/controls/BasicSellDetailsLayout'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicSellDetailsControlProps {
  token: string
  autoSellTriggerData: AutoSellTriggerData
  isAutoSellActive: boolean
}

export function BasicSellDetailsControl({
  token,
  autoSellTriggerData,
  isAutoSellActive,
}: BasicSellDetailsControlProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()

  const triggerColRatio = new BigNumber(Math.random() * 100)
  const nextSellPrice = new BigNumber(Math.random() * 1000)
  const targetColRatio = new BigNumber(Math.random() * 100)
  const threshold = new BigNumber(Math.random() * 1000)

  return (
    <Grid>
      {isAutoSellActive ? (
        <BasicSellDetailsLayout
          token={token}
          triggerColRatio={triggerColRatio}
          nextSellPrice={nextSellPrice}
          targetColRatio={targetColRatio}
          threshold={threshold}
          autoSellTriggerData={autoSellTriggerData}
        />
      ) : (
        <SetupBanner
          header={t('auto-sell.banner.header')}
          content={t('auto-sell.banner.content')}
          button={t('auto-sell.banner.button')}
          backgroundImage="/static/img/setup-banner/auto-sell.svg"
          backgroundColor={setupBannerGradientPresets.autoSell[0]}
          backgroundColorEnd={setupBannerGradientPresets.autoSell[1]}
          handleClick={() => {
            uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
              type: 'Protection',
              currentProtectionFeature: 'autoSell',
            })
          }}
        />
      )}
    </Grid>
  )
}
