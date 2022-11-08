import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { useAppContext } from 'components/AppContextProvider'
import { useAutomationContext } from 'components/AutomationContextProvider'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import { getOnCloseEstimations } from 'features/automation/common/estimations/onCloseEstimations'
import { AddAutoTakeProfitInfoSection } from 'features/automation/optimization/autoTakeProfit/controls/AddAutoTakeProfitInfoSection'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import { prepareAutoTakeProfitResetData } from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

interface SidebarAutoTakeProfitEditingStageProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  closePickerConfig: PickCloseStateProps
  isEditing: boolean
  sliderConfig: SliderValuePickerProps
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitEditingStage({
  autoTakeProfitState,
  closePickerConfig,
  isEditing,
  sliderConfig,
  errors,
  warnings,
}: SidebarAutoTakeProfitEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const readOnlyAutoTakeProfitEnabled = useFeatureToggle('ReadOnlyAutoTakeProfit')

  const {
    autoTakeProfitTriggerData,
    positionData: { ilk, id, collateralizationRatio, debt, debtFloor, token },
  } = useAutomationContext()

  useDebouncedCallback(
    (value) =>
      trackingEvents.automation.inputChange(
        AutomationEventIds.MoveSlider,
        Pages.TakeProfit,
        CommonAnalyticsSections.Form,
        {
          vaultId: id.toString(),
          ilk: ilk,
          collateralRatio: collateralizationRatio.times(100).decimalPlaces(2).toString(),
          triggerValue: value,
        },
      ),
    autoTakeProfitState.executionPrice.decimalPlaces(2).toString(),
  )

  const isVaultEmpty = debt.isZero()

  if (readOnlyAutoTakeProfitEnabled && !isVaultEmpty) {
    return (
      <SidebarFormInfo
        title={t('auto-take-profit.adding-new-triggers-disabled')}
        description={t('auto-take-profit.adding-new-triggers-disabled-description')}
      />
    )
  }

  if (isVaultEmpty && autoTakeProfitTriggerData.isTriggerEnabled) {
    return (
      <SidebarFormInfo
        title={t('auto-take-profit.closed-vault-existing-trigger-header')}
        description={t('auto-take-profit.closed-vault-existing-trigger-description')}
      />
    )
  }

  return (
    <>
      <PickCloseState {...closePickerConfig} />
      <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
        {t('auto-take-profit.set-trigger-description', {
          token,
          executionPrice: autoTakeProfitState.executionPrice.decimalPlaces(2),
        })}
        <AppLink href="https://kb.oasis.app/help/take-profit" sx={{ fontSize: 2 }}>
          {t('here')}.
        </AppLink>
      </Text>
      <SliderValuePicker {...sliderConfig} />
      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={{ debtFloor, token }} />
          <VaultWarnings warningMessages={warnings} ilkData={{ debtFloor }} />
        </>
      )}
      {isEditing && (
        <>
          <SidebarResetButton
            clear={() => {
              uiChanges.publish(AUTO_TAKE_PROFIT_FORM_CHANGE, {
                type: 'reset',
                resetData: prepareAutoTakeProfitResetData(
                  autoTakeProfitState,
                  autoTakeProfitTriggerData,
                ),
              })
            }}
          />
          <AutoTakeProfitInfoSectionControl
            toCollateral={autoTakeProfitState.toCollateral}
            triggerColPrice={autoTakeProfitState.executionPrice}
            triggerColRatio={autoTakeProfitState.executionCollRatio}
          />
        </>
      )}
    </>
  )
}

interface AutoTakeProfitInfoSectionControlProps {
  toCollateral: boolean
  triggerColPrice: BigNumber
  triggerColRatio: BigNumber
}

function AutoTakeProfitInfoSectionControl({
  toCollateral,
  triggerColPrice,
  triggerColRatio,
}: AutoTakeProfitInfoSectionControlProps) {
  const {
    environmentData: { ethMarketPrice },
    positionData: { debt, debtOffset, token, lockedCollateral },
  } = useAutomationContext()

  const {
    estimatedGasFeeOnTrigger,
    estimatedOasisFeeOnTrigger,
    totalTriggerCost,
  } = getOnCloseEstimations({
    colMarketPrice: triggerColPrice,
    colOraclePrice: triggerColPrice,
    debt: debt,
    debtOffset: debtOffset,
    ethMarketPrice,
    lockedCollateral: lockedCollateral,
    toCollateral: toCollateral,
  })

  return (
    <AddAutoTakeProfitInfoSection
      debtRepaid={debt}
      estimatedOasisFeeOnTrigger={estimatedOasisFeeOnTrigger}
      estimatedGasFeeOnTrigger={estimatedGasFeeOnTrigger}
      token={token}
      totalTriggerCost={totalTriggerCost}
      triggerColPrice={triggerColPrice}
      triggerColRatio={triggerColRatio}
    />
  )
}
