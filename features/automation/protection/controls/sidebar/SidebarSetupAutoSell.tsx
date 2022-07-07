import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import { AutoSellTriggerData } from 'features/automation/protection/autoSellTriggerDataExtractor'
import { commonProtectionDropdownItems } from 'features/automation/protection/common/dropdown'
import { isDropdownDisabled } from 'features/sidebar/isDropdownDisabled'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  vault: Vault
  autoSellTriggerData: AutoSellTriggerData
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
  const { uiChanges } = useAppContext()

  if (isAutoSellActive) {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-sell.form-title'),
      dropdown: {
        forcePanel: 'autoSell',
        disabled: isDropdownDisabled({ stage }),
        items: commonProtectionDropdownItems(uiChanges),
      },
      content: (
        <Grid gap={3}>
          <MultipleRangeSlider
            min={170}
            max={500}
            onChange={(value) => {
              console.log(value)
            }}
            defaultValue={{
              value0: 200,
              value1: 220,
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
            hasAuxiliary={true}
            hasError={false}
            token={vault.token}
            onChange={(e) => console.log(e.target.value)}
            onAuxiliaryChange={() => {}}
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
        </Grid>
      ),
      primaryButton: {
        label: 'Confirm',
        disabled: true,
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
