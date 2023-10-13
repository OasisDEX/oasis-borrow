import { trackingEvents } from 'analytics/trackingEvents'
import {
  MixpanelAutomationEventIds,
  MixpanelCommonAnalyticsSections,
  MixpanelPages,
} from 'analytics/types'
import type BigNumber from 'bignumber.js'
import { useAutomationContext } from 'components/context/AutomationContextProvider'
import { PickCloseState } from 'components/dumb/PickCloseState'
import { SliderValuePicker } from 'components/dumb/SliderValuePicker'
import { GasEstimation } from 'components/GasEstimation'
import { AppLink } from 'components/Links'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import {
  VaultChangesInformationContainer,
  VaultChangesInformationItem,
} from 'components/vault/VaultChangesInformation'
import {
  closeVaultOptions,
  sidebarAutomationFeatureCopyMap,
} from 'features/automation/common/consts'
import { AutomationValidationMessages } from 'features/automation/common/sidebars/AutomationValidationMessages'
import { AutomationFeatures } from 'features/automation/common/types'
import { StopLossCommonOrderInformation } from 'features/automation/protection/common/controls/StopLossCommonOrderInformation'
import { STOP_LOSS_FORM_CHANGE } from 'features/automation/protection/stopLoss/state/StopLossFormChange.constants'
import type { StopLossFormChange } from 'features/automation/protection/stopLoss/state/StopLossFormChange.types'
import type { CloseVaultTo } from 'features/multiply/manage/pipes/CloseVaultTo.types'
import { EXTERNAL_LINKS } from 'helpers/applicationLinks'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { uiChanges } from 'helpers/uiChanges'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Text } from 'theme-ui'

interface SetDownsideProtectionInformationProps {
  executionPrice: BigNumber
  ethPrice: BigNumber
  isCollateralActive: boolean
  isOpenFlow?: boolean
}

export function SetDownsideProtectionInformation({
  executionPrice,
  isCollateralActive,
  isOpenFlow,
}: SetDownsideProtectionInformationProps) {
  const { t } = useTranslation()
  const {
    metadata: {
      stopLossMetadata: {
        methods: { getMaxToken },
      },
    },
  } = useAutomationContext()
  const [stopLossState] = useUIChanges<StopLossFormChange>(STOP_LOSS_FORM_CHANGE)

  const afterMaxToken = getMaxToken(stopLossState)

  return (
    <VaultChangesInformationContainer title={t('protection.on-stop-loss-trigger')}>
      <StopLossCommonOrderInformation
        afterMaxToken={afterMaxToken}
        isCollateralActive={isCollateralActive}
        executionPrice={executionPrice}
      />

      {!isOpenFlow && (
        <VaultChangesInformationItem
          label={`${t('protection.max-cost')}`}
          value={<GasEstimation />}
        />
      )}
    </VaultChangesInformationContainer>
  )
}

export interface SidebarAdjustStopLossEditingStageProps {
  executionPrice: BigNumber
  errors: string[]
  warnings: string[]
  stopLossState: StopLossFormChange
  isEditing: boolean
  isOpenFlow?: boolean
}

export function SidebarAdjustStopLossEditingStage({
  isEditing,
  errors,
  warnings,
  stopLossState,
  executionPrice,
  isOpenFlow,
}: SidebarAdjustStopLossEditingStageProps) {
  const { t } = useTranslation()
  const {
    environmentData: { ethMarketPrice },
    metadata: {
      stopLossMetadata: {
        callbacks: { onSliderChange, onCloseToChange },
        methods: { getSliderPercentageFill, getRightBoundary },
        settings: { fixedCloseToToken, sliderStep, sliderDirection },
        translations: { ratioParamTranslationKey },
        values: { sliderMin, sliderMax, resetData },
      },
    },
    positionData: { id, ilk, token, debt, positionRatio, debtToken },
    triggerData: { stopLossTriggerData },
  } = useAutomationContext()

  useDebouncedCallback(
    (value) =>
      trackingEvents.automation.inputChange(
        MixpanelAutomationEventIds.MoveSlider,
        !id.isZero() ? MixpanelPages.StopLoss : MixpanelPages.OpenVault,
        MixpanelCommonAnalyticsSections.Form,
        {
          vaultId: !id.isZero() ? id.toString() : 'n/a',
          ilk: ilk,
          collateralRatio: positionRatio.times(100).decimalPlaces(2).toString(),
          triggerValue: value,
        },
      ),
    stopLossState.stopLossLevel.decimalPlaces(2).toString(),
  )

  const isVaultEmpty = debt.isZero()
  const feature = t(sidebarAutomationFeatureCopyMap[AutomationFeatures.STOP_LOSS])

  if (isVaultEmpty && stopLossTriggerData.isStopLossEnabled) {
    return (
      <SidebarFormInfo
        title={t('automation.closed-vault-existing-trigger-header', { feature })}
        description={t('automation.closed-vault-existing-trigger-description', { feature })}
      />
    )
  }

  if (isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('automation.closed-vault-not-existing-trigger-header', { feature, debtToken })}
        description={t('automation.closed-vault-not-existing-trigger-description', {
          feature,
          debtToken,
        })}
      />
    )
  }

  const sliderPercentageFill = getSliderPercentageFill(stopLossState)
  const rightBoundry = getRightBoundary(stopLossState)

  return (
    <>
      {!debt.isZero() ? (
        <Grid>
          {!fixedCloseToToken && (
            <PickCloseState
              collateralTokenSymbol={token}
              isCollateralActive={stopLossState.collateralActive}
              onClickHandler={(optionName: string) => {
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'close-type',
                  toCollateral: optionName === closeVaultOptions[0],
                })
                trackingEvents.automation.buttonClick(
                  MixpanelAutomationEventIds.CloseToX,
                  !id.isZero() ? MixpanelPages.StopLoss : MixpanelPages.OpenVault,
                  MixpanelCommonAnalyticsSections.Form,
                  {
                    vaultId: !id.isZero() ? id.toString() : 'n/a',
                    ilk: ilk,
                    closeTo: optionName as CloseVaultTo,
                  },
                )
                onCloseToChange && onCloseToChange({ optionName })
              }}
            />
          )}
          <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
            {t('protection.set-downside-protection-desc', {
              ratioParam: t(ratioParamTranslationKey),
            })}{' '}
            <AppLink href={EXTERNAL_LINKS.KB.STOP_LOSS} sx={{ fontSize: 2 }}>
              {t('here')}.
            </AppLink>
          </Text>
          <SliderValuePicker
            disabled={false}
            step={sliderStep}
            leftBoundryFormatter={(x: BigNumber) => (x.isZero() ? '-' : formatPercent(x))}
            rightBoundryFormatter={(x: BigNumber) =>
              x.isZero() ? '-' : '$ ' + formatAmount(x, 'USD')
            }
            sliderPercentageFill={sliderPercentageFill}
            lastValue={stopLossState.stopLossLevel}
            maxBoundry={sliderMax}
            minBoundry={sliderMin}
            rightBoundry={rightBoundry}
            leftBoundry={stopLossState.stopLossLevel}
            onChange={(slCollRatio) => {
              if (stopLossState.collateralActive === undefined) {
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'close-type',
                  toCollateral: false,
                })
              }

              uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                type: 'stop-loss-level',
                stopLossLevel: slCollRatio,
              })

              onSliderChange && onSliderChange({ value: slCollRatio })
            }}
            leftLabel={t('protection.stop-loss-something', { value: t(ratioParamTranslationKey) })}
            rightLabel={t('slider.set-stoploss.right-label')}
            direction={sliderDirection}
          />
        </Grid>
      ) : (
        <SidebarFormInfo
          title={t('protection.closed-vault-existing-sl-header')}
          description={t('protection.closed-vault-existing-sl-description')}
        />
      )}

      {isEditing && (
        <>
          {!isOpenFlow && (
            <SidebarResetButton
              clear={() => {
                uiChanges.publish(STOP_LOSS_FORM_CHANGE, {
                  type: 'reset',
                  resetData,
                })
              }}
            />
          )}
          <Grid>
            {!stopLossState.stopLossLevel.isZero() && (
              <>
                <AutomationValidationMessages messages={errors} type="error" />
                <AutomationValidationMessages messages={warnings} type="warning" />
              </>
            )}
            <SetDownsideProtectionInformation
              executionPrice={executionPrice}
              ethPrice={ethMarketPrice}
              isCollateralActive={stopLossState.collateralActive}
              isOpenFlow={isOpenFlow}
            />
            <Text as="p" variant="paragraph3" sx={{ fontWeight: 'semiBold' }}>
              {t('protection.not-guaranteed')}
            </Text>
            <Text as="p" variant="paragraph3">
              {t('protection.guarantee-factors')}{' '}
              <AppLink href={EXTERNAL_LINKS.KB.AUTOMATION} sx={{ fontWeight: 'body' }}>
                {t('protection.learn-more-about-automation')}
              </AppLink>
            </Text>
          </Grid>
        </>
      )}
    </>
  )
}
