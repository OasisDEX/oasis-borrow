import {
  AutomationEventIds,
  CommonAnalyticsSections,
  Pages,
  trackingEvents,
} from 'analytics/analytics'
import BigNumber from 'bignumber.js'
import { IlkData } from 'blockchain/ilks'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { PickCloseState, PickCloseStateProps } from 'components/dumb/PickCloseState'
import { SliderValuePicker, SliderValuePickerProps } from 'components/dumb/SliderValuePicker'
import { AppLink } from 'components/Links'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { SidebarFormInfo } from 'components/vault/SidebarFormInfo'
import { VaultErrors } from 'components/vault/VaultErrors'
import { VaultWarnings } from 'components/vault/VaultWarnings'
import {
  AUTO_TAKE_PROFIT_FORM_CHANGE,
  AutoTakeProfitFormChange,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitFormChange'
import {
  AutoTakeProfitTriggerData,
  prepareAutoTakeProfitResetData,
} from 'features/automation/optimization/autoTakeProfit/state/autoTakeProfitTriggerData'
import { VaultErrorMessage } from 'features/form/errorMessagesHandler'
import { VaultWarningMessage } from 'features/form/warningMessagesHandler'
import { useDebouncedCallback } from 'helpers/useDebouncedCallback'
import { useFeatureToggle } from 'helpers/useFeatureToggle'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Text } from 'theme-ui'

import { AutoTakeProfitInfoSectionControl } from '../controls/AutoTakeProfitInfoSectionControl'

interface SidebarAutoTakeProfitEditingStageProps {
  autoTakeProfitState: AutoTakeProfitFormChange
  autoTakeProfitTriggerData: AutoTakeProfitTriggerData
  closePickerConfig: PickCloseStateProps
  ethMarketPrice: BigNumber
  isEditing: boolean
  sliderConfig: SliderValuePickerProps
  tokenMarketPrice: BigNumber
  vault: Vault
  ilkData: IlkData
  errors: VaultErrorMessage[]
  warnings: VaultWarningMessage[]
}

export function SidebarAutoTakeProfitEditingStage({
  autoTakeProfitState,
  autoTakeProfitTriggerData,
  closePickerConfig,
  ethMarketPrice,
  isEditing,
  sliderConfig,
  tokenMarketPrice,
  vault,
  ilkData,
  errors,
  warnings,
}: SidebarAutoTakeProfitEditingStageProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const readOnlyAutoTakeProfitEnabled = useFeatureToggle('ReadOnlyAutoTakeProfit')

  useDebouncedCallback(
    (value) =>
      trackingEvents.automation.inputChange(
        AutomationEventIds.MoveSlider,
        Pages.TakeProfit,
        CommonAnalyticsSections.Form,
        {
          vaultId: vault.id.toString(),
          ilk: vault.ilk,
          collateralRatio: vault.collateralizationRatio.times(100).decimalPlaces(2).toString(),
          triggerValue: value,
        },
      ),
    autoTakeProfitState.executionPrice.decimalPlaces(2).toString(),
  )

  const isVaultEmpty = vault.debt.isZero()

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
      <>
        <PickCloseState {...closePickerConfig} />
        <Text as="p" variant="paragraph3" sx={{ color: 'neutral80' }}>
          {t('auto-take-profit.set-trigger-description', {
            token: vault.token,
            executionPrice: autoTakeProfitState.executionPrice.decimalPlaces(2),
          })}
          <AppLink href="https://kb.oasis.app/help/take-profit" sx={{ fontSize: 2 }}>
            {t('here')}.
          </AppLink>
        </Text>
        <SliderValuePicker {...sliderConfig} />
      </>

      {isEditing && (
        <>
          <VaultErrors errorMessages={errors} ilkData={ilkData} />
          <VaultWarnings warningMessages={warnings} ilkData={ilkData} />
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
            debt={vault.debt}
            debtOffset={vault.debtOffset}
            ethMarketPrice={ethMarketPrice}
            lockedCollateral={vault.lockedCollateral}
            toCollateral={autoTakeProfitState.toCollateral}
            token={vault.token}
            tokenMarketPrice={tokenMarketPrice}
            triggerColPrice={autoTakeProfitState.executionPrice}
            triggerColRatio={autoTakeProfitState.executionCollRatio}
          />
        </>
      )}
    </>
  )
}
