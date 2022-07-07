import { TriggerType } from '@oasisdex/automation'
import { BigNumber } from 'bignumber.js'
import { addAutomationBotTrigger } from 'blockchain/calls/automationBot'
import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { MaxGasPriceSection } from 'features/automation/basicBuySell/MaxGasPriceSection/MaxGasPriceSection'
import {
  BasicBSTriggerData,
  prepareAddBasicBSTriggerData,
} from 'features/automation/common/basicBSTriggerData'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import {
  BASIC_SELL_FORM_CHANGE,
  BasicBSFormChange,
} from 'features/automation/protection/common/UITypes/basicBSFormChange'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { handleNumericInput } from 'helpers/input'
import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  vault: Vault
  autoSellTriggerData: BasicBSTriggerData
  isAutoSellActive: boolean
  stage?: any // TODO
}

export function SidebarSetupAutoSell({
  vault,
  // autoSellTriggerData, not used for now
  isAutoSellActive,
  stage,
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const { uiChanges, txHelpers$ } = useAppContext()
  const [txHelpers] = useObservable(txHelpers$)
  const [uiState] = useUIChanges<BasicBSFormChange>(BASIC_SELL_FORM_CHANGE)

  const txData = prepareAddBasicBSTriggerData({
    vaultData: vault,
    triggerType: TriggerType.BasicSell,
    execCollRatio: uiState.execCollRatio,
    targetCollRatio: uiState.targetCollRatio,
    maxBuyOrMinSellPrice: uiState.withThreshold ? uiState.maxBuyOrMinSellPrice || zero : zero, // todo we will need here validation that this field cant be empty
    continuous: uiState.continuous, // leave as default
    deviation: uiState.deviation,
    replacedTriggerId: uiState.triggerId,
  })

  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-sell.form-title'),
      dropdown: {
        forcePanel: 'autoSell',
        disabled: isDropdownDisabled({ stage }),
        items: commonProtectionDropdownItems(uiChanges, t),
      },
      content: (
        <Grid gap={3}>
          <MultipleRangeSlider
            min={170}
            max={500}
            onChange={(value) => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'execution-coll-ratio',
                execCollRatio: new BigNumber(value.value0),
              })
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'target-coll-ratio',
                targetCollRatio: new BigNumber(value.value1),
              })
            }}
            defaultValue={{
              value0: uiState.execCollRatio.toNumber(),
              value1: uiState.targetCollRatio.toNumber(),
            }}
            valueColors={{
              value1: 'onSuccess',
            }}
            leftDescription={t('auto-sell.sell-trigger-ratio')}
            rightDescription={t('auto-sell.target-coll-ratio')}
            rightThumbColor="primary"
          />
          <VaultActionInput
            action={t('auto-sell.set-min-sell-price')}
            amount={uiState.maxBuyOrMinSellPrice}
            hasAuxiliary={false}
            hasError={false}
            token={vault.token}
            onChange={handleNumericInput((maxBuyOrMinSellPrice) => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'max-buy-or-sell-price',
                maxBuyOrMinSellPrice,
              })
            })}
            onToggle={(toggleStatus) => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'with-threshold',
                withThreshold: toggleStatus,
              })
            }}
            showToggle={true}
            toggleOnLabel={t('protection.set-no-threshold')}
            toggleOffLabel={t('protection.set-threshold')}
            toggleOffPlaceholder={t('protection.no-threshold')}
          />
          <SidebarResetButton
            clear={() => {
              alert('Reset!')
            }}
          />
          <MaxGasPriceSection
            onChange={(maxGasPercentagePrice) => {
              uiChanges.publish(BASIC_SELL_FORM_CHANGE, {
                type: 'max-gas-percentage-price',
                maxGasPercentagePrice,
              })
            }}
            defaultValue={uiState.maxGasPercentagePrice}
          />
        </Grid>
      ),
      primaryButton: {
        label: 'Confirm',
        disabled: false,
        action: () => {
          if (txHelpers) {
            txHelpers
              .sendWithGasEstimation(addAutomationBotTrigger, txData)
              .subscribe((next) => console.log(next))
          }
        },
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
