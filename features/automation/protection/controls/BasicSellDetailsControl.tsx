import { useAppContext } from 'components/AppContextProvider'
import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicSellDetailsLayout } from 'features/automation/protection/controls/BasicSellDetailsLayout'
import { PriceInfo } from 'features/shared/priceInfo'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicSellDetailsControlProps {
  token: string
  basicSellTriggerData: BasicBSTriggerData
  isAutoSellActive: boolean
  priceInfo: PriceInfo
}

export function BasicSellDetailsControl({
  token,
  basicSellTriggerData,
  isAutoSellActive,
  priceInfo,
}: BasicSellDetailsControlProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicSellTriggerData

  return (
    <Grid>
      {isAutoSellActive ? (
        <BasicSellDetailsLayout
          token={token}
          triggerColRatio={execCollRatio}
          nextSellPrice={priceInfo.nextCollateralPrice}
          targetColRatio={targetCollRatio}
          threshold={maxBuyOrMinSellPrice}
          basicSellTriggerData={basicSellTriggerData}
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
