import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SetupBanner, setupBannerGradientPresets } from 'components/vault/SetupBanner'
import { StopLossTriggerData } from 'features/automation/protection/common/stopLossTriggerData'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { StopLossDetailsLayout } from 'features/automation/protection/controls/StopLossDetailsLayout'
import { PriceInfo } from 'features/shared/priceInfo'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

import { getIsEditingProtection } from '../common/helpers'
import { ADD_FORM_CHANGE, AddFormChange } from '../common/UITypes/AddFormChange'

interface StopLossDetailsControlProps {
  ilkData: IlkData
  stopLossTriggerData: StopLossTriggerData
  priceInfo: PriceInfo
  vault: Vault
  isStopLossActive: boolean
}

export function StopLossDetailsControl({
  ilkData,
  stopLossTriggerData,
  priceInfo,
  vault,
  isStopLossActive,
}: StopLossDetailsControlProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const [lastUIState] = useUIChanges<AddFormChange>(ADD_FORM_CHANGE)

  const props = {
    isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
    slRatio: stopLossTriggerData.stopLossLevel,
    vaultDebt: vault.debt,
    currentOraclePrice: priceInfo.currentCollateralPrice,
    nextOraclePrice: priceInfo.nextCollateralPrice,
    lockedCollateral: vault.lockedCollateral,
    collateralizationRatioAtNextPrice: vault.collateralizationRatioAtNextPrice,

    liquidationRatio: ilkData.liquidationRatio,
    liquidationPenalty: ilkData.liquidationPenalty,
    isStaticPrice: priceInfo.isStaticCollateralPrice,
    token: vault.token,

    afterSlRatio: lastUIState ? lastUIState.selectedSLValue?.dividedBy(100) : new BigNumber(0),
    isCollateralActive: !!lastUIState?.collateralActive,
    isEditing: getIsEditingProtection({
      isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
      selectedSLValue: lastUIState.selectedSLValue,
      stopLossLevel: stopLossTriggerData.stopLossLevel,
      collateralActive: lastUIState.collateralActive,
      isToCollateral: stopLossTriggerData.isToCollateral,
    }),
  }

  return (
    <Grid>
      {isStopLossActive ? (
        <StopLossDetailsLayout {...props} />
      ) : (
        <SetupBanner
          header={t('vault-banners.setup-stop-loss.header')}
          content={t('vault-banners.setup-stop-loss.content', { token: vault.token })}
          button={t('vault-banners.setup-stop-loss.button')}
          backgroundImage="/static/img/setup-banner/stop-loss.svg"
          backgroundColor={setupBannerGradientPresets.stopLoss[0]}
          backgroundColorEnd={setupBannerGradientPresets.stopLoss[1]}
          handleClick={() => {
            uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
              type: 'Protection',
              currentProtectionFeature: 'stopLoss',
            })
          }}
        />
      )}
    </Grid>
  )
}
