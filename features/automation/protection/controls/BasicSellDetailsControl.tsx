import { collateralPriceAtRatio } from 'blockchain/vault.maths'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { AppLink } from 'components/Links'
import { BasicBSTriggerData } from 'features/automation/common/basicBSTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { BasicSellDetailsLayout } from 'features/automation/protection/controls/BasicSellDetailsLayout'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface BasicSellDetailsControlProps {
  vault: Vault
  basicSellTriggerData: BasicBSTriggerData
  isAutoSellActive: boolean
}

export function BasicSellDetailsControl({
  vault,
  basicSellTriggerData,
  isAutoSellActive,
}: BasicSellDetailsControlProps) {
  const readOnlyBasicBSEnabled = useFeatureToggle('ReadOnlyBasicBS')
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const { execCollRatio, targetCollRatio, maxBuyOrMinSellPrice } = basicSellTriggerData
  const isDebtZero = vault.debt.isZero()

  const executionPrice = collateralPriceAtRatio({
    colRatio: execCollRatio.div(100),
    collateral: vault.lockedCollateral,
    vaultDebt: vault.debt,
  })

  if (readOnlyBasicBSEnabled) {
    return null
  }

  if (isDebtZero) {
    return null
  }

  return (
    <Grid>
      {isAutoSellActive ? (
        <BasicSellDetailsLayout
          token={vault.token}
          triggerColRatio={execCollRatio}
          nextSellPrice={executionPrice}
          targetColRatio={targetCollRatio}
          threshold={maxBuyOrMinSellPrice}
          basicSellTriggerData={basicSellTriggerData}
        />
      ) : (
        <Banner
          title={t('auto-sell.banner.header')}
          description={
            <>
              {t('auto-sell.banner.content')}{' '}
              <AppLink href="https://kb.oasis.app/help" sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>
          }
          image={{
            src: '/static/img/setup-banner/auto-sell.svg',
            backgroundColor: bannerGradientPresets.autoSell[0],
            backgroundColorEnd: bannerGradientPresets.autoSell[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: 'autoSell',
              })
            },
            text: t('auto-sell.banner.button'),
          }}
        />
      )}
    </Grid>
  )
}
