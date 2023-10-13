import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import { Banner } from 'components/Banner'
import { bannerGradientPresets } from 'components/Banner.constants'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { AppLink } from 'components/Links'
import { AUTOMATION_CHANGE_FEATURE } from 'features/automation/common/state/automationFeatureChange.constants'
import { AutomationFeatures } from 'features/automation/common/types'
import { StopLossDetailsLayout } from 'features/automation/protection/stopLoss/controls/StopLossDetailsLayout'
import { checkIfIsEditingStopLoss } from 'features/automation/protection/stopLoss/helpers'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface StopLossDetailsControlProps {
  isStopLossActive: boolean
}

export function StopLossDetailsControl({ isStopLossActive }: StopLossDetailsControlProps) {
  const { t } = useTranslation()
  const {
    metadata: {
      stopLossMetadata: {
        detailCards,
        methods: { getMaxToken, getExecutionPrice },
        translations: { ratioParamTranslationKey, stopLossLevelCardFootnoteKey },
        values: {
          collateralDuringLiquidation,
          initialSlRatioWhenTriggerDoesntExist,
          triggerMaxToken,
          dynamicStopLossPrice,
        },
      },
    },
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
    triggerData: {
      stopLossTriggerData: { isStopLossEnabled, stopLossLevel, isToCollateral },
    },
  } = useAutomationContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)
  const afterMaxToken = getMaxToken(stopLossState)
  const afterDynamicStopLossPrice = getExecutionPrice(stopLossState)

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
          ratioParamTranslationKey={ratioParamTranslationKey}
          stopLossLevelCardFootnoteKey={stopLossLevelCardFootnoteKey}
          detailCards={detailCards}
          dynamicStopLossPrice={dynamicStopLossPrice}
          afterDynamicStopLossPrice={afterDynamicStopLossPrice}
        />
      ) : (
        <Banner
          title={t('vault-banners.setup-stop-loss.header')}
          description={
            <>
              {t('vault-banners.setup-stop-loss.content', { token: token })}{' '}
              <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
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
                MixpanelAutomationEventIds.SelectStopLoss,
                MixpanelPages.ProtectionTab,
                MixpanelCommonAnalyticsSections.Banner,
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
