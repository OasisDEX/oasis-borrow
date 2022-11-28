import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { Banner, bannerGradientPresets } from 'components/Banner'
import { AppLink } from 'components/Links'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange'
import { AutomationFeatures } from 'features/automation/common/types'
import { StopLossDetailsLayout } from 'features/automation/protection/stopLoss/controls/StopLossDetailsLayout'
import { checkIfIsEditingStopLoss } from 'features/automation/protection/stopLoss/helpers'
import {
  STOP_LOSS_FORM_CHANGE,
  StopLossFormChange,
} from 'features/automation/protection/stopLoss/state/StopLossFormChange'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface StopLossDetailsControlProps {
  isStopLossActive: boolean
}

export function StopLossDetailsControl({ isStopLossActive }: StopLossDetailsControlProps) {
  const { t } = useTranslation()
  const {
    stopLossTriggerData: { isStopLossEnabled, stopLossLevel, isToCollateral },
    positionData: {
      positionRatio,
      nextPositionRatio,
      debt,
      id,
      ilk,
      liquidationPenalty,
      liquidationRatio,
      liquidationPrice,
      lockedCollateral,
      token,
      debtToken,
    },
    metadata: {
      stopLoss: {
        detailCards,
        methods: { getMaxToken },
        translations: { ratioParam },
        values: {
          collateralDuringLiquidation,
          initialSlRatioWhenTriggerDoesntExist,
          triggerMaxToken,
        },
      },
    },
  } = useAutomationContext()
  const { uiChanges } = useAppContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)
  const afterMaxToken = getMaxToken(stopLossState)

  return (
    <>
      {isStopLossActive ? (
        <StopLossDetailsLayout
          token={token}
          debtToken={debtToken}
          stopLossLevel={stopLossLevel}
          afterStopLossLevel={stopLossState.stopLossLevel}
          debt={debt}
          isStopLossEnabled={isStopLossEnabled}
          liquidationRatio={liquidationRatio}
          liquidationPrice={liquidationPrice}
          liquidationPenalty={liquidationPenalty}
          lockedCollateral={lockedCollateral}
          nextPositionRatio={nextPositionRatio}
          collateralDuringLiquidation={collateralDuringLiquidation}
          triggerMaxToken={triggerMaxToken}
          afterMaxToken={afterMaxToken}
          isCollateralActive={!!stopLossState?.collateralActive}
          isEditing={checkIfIsEditingStopLoss({
            isStopLossEnabled: isStopLossEnabled,
            selectedSLValue: stopLossState.stopLossLevel,
            stopLossLevel,
            collateralActive: stopLossState.collateralActive,
            isToCollateral,
            isRemoveForm: stopLossState.currentForm === 'remove',
            initialSlRatioWhenTriggerDoesntExist,
          })}
          positionRatio={positionRatio}
          ratioParam={ratioParam}
          detailCards={detailCards}
        />
      ) : (
        <Banner
          title={t('vault-banners.setup-stop-loss.header')}
          description={
            <>
              {t('vault-banners.setup-stop-loss.content', { token: token })}{' '}
              <AppLink href="https://kb.oasis.app/help/stop-loss-protection" sx={{ fontSize: 2 }}>
                {t('here')}.
              </AppLink>
            </>
          }
          image={{
            src: '/static/img/setup-banner/stop-loss.svg',
            backgroundColor: bannerGradientPresets.stopLoss[0],
            backgroundColorEnd: bannerGradientPresets.stopLoss[1],
          }}
          button={{
            action: () => {
              uiChanges.publish(AUTOMATION_CHANGE_FEATURE, {
                type: 'Protection',
                currentProtectionFeature: AutomationFeatures.STOP_LOSS,
              })
              trackingEvents.automation.buttonClick(
                AutomationEventIds.SelectStopLoss,
                Pages.ProtectionTab,
                CommonAnalyticsSections.Banner,
                { vaultId: id.toString(), ilk: ilk },
              )
            },
            text: t('vault-banners.setup-stop-loss.button'),
          }}
        />
      )}
    </>
  )
}
