import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange'
import { StopLossDetailsLayout } from 'features/automation/protection/stopLoss/controls/StopLossDetailsLayout'
import { getIsEditingStopLoss } from 'features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface StopLossDetailsControlProps {
  ilkData: IlkData
  stopLossTriggerData: StopLossTriggerData
  vault: Vault
  isStopLossActive: boolean
}

export function StopLossDetailsControl({
  ilkData,
  stopLossTriggerData,
  vault,
  isStopLossActive,
}: StopLossDetailsControlProps) {
  const { uiChanges } = useAppContext()
  const { t } = useTranslation()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  return (
    <Grid>
      {isStopLossActive ? (
        <StopLossDetailsLayout
          slRatio={stopLossTriggerData.stopLossLevel}
          afterSlRatio={stopLossState.stopLossLevel.dividedBy(100)}
          vaultDebt={vault.debt}
          isStopLossEnabled={stopLossTriggerData.isStopLossEnabled}
          lockedCollateral={vault.lockedCollateral}
          token={vault.token}
          liquidationRatio={ilkData.liquidationRatio}
          liquidationPenalty={ilkData.liquidationPenalty}
          collateralizationRatioAtNextPrice={vault.collateralizationRatioAtNextPrice}
          isCollateralActive={!!stopLossState?.collateralActive}
          isEditing={getIsEditingStopLoss({
            isStopLossEnabled: stopLossTriggerData.isStopLossEnabled,
            selectedSLValue: stopLossState.stopLossLevel,
            stopLossLevel: stopLossTriggerData.stopLossLevel,
            collateralActive: stopLossState.collateralActive,
            isToCollateral: stopLossTriggerData.isToCollateral,
            isRemoveForm: stopLossState.currentForm === 'remove',
          })}
          collateralizationRatio={vault.collateralizationRatio}
        />
      ) : (
        <Banner
          title={t('vault-banners.setup-stop-loss.header')}
          description={t('vault-banners.setup-stop-loss.content', { token: vault.token })}
          image={{
            src: '/static/img/setup-banner/stop-loss.svg',
            backgroundColor: bannerGradientPresets.stopLoss[0],
            backgroundColorEnd: bannerGradientPresets.stopLoss[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: 'stopLoss',
              })
            },
            text: t('vault-banners.setup-stop-loss.button'),
          }}
        />
      )}
    </Grid>
  )
}
