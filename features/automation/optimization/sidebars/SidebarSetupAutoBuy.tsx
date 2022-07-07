import { Vault } from 'blockchain/vaults'
import { useAppContext } from 'components/AppContextProvider'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
import { useObservable } from 'helpers/observableHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
}

export function SidebarSetupAutoBuy({ isAutoBuyOn }: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  const { uiChanges } = useAppContext()
  const [activeAutomationFeature] = useObservable(
    uiChanges.subscribe<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE),
  )

  if (isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: 'Auto Buy Setup',
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
            leftDescription={t('auto-buy.target-coll-ratio')}
            rightDescription={t('auto-buy.trigger-coll-ratio')}
            minDescription={`(${t('auto-buy.min-ratio')})`}
          />
          <VaultActionInput
            action={t('auto-buy.set-max-buy-price')}
            hasAuxiliary={true}
            hasError={false}
            token="ETH"
            onChange={(e) => console.log(e.target.value)}
            onAuxiliaryChange={() => {}}
            showToggle={true}
            toggleOnLabel={t('auto-buy.set-no-threshold')}
            toggleOffLabel={t('auto-buy.set-threshold')}
            toggleOffPlaceholder={t('auto-buy.no-threshold')}
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
