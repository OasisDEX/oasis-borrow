import { Vault } from 'blockchain/vaults'
// import { useAppContext } from 'components/AppContextProvider'
import { RetryableLoadingButtonProps } from 'components/dumb/RetryableLoadingButton'
import { SidebarSection, SidebarSectionProps } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { SidebarResetButton } from 'components/vault/sidebar/SidebarResetButton'
import { VaultActionInput } from 'components/vault/VaultActionInput'
import {
  AUTOMATION_CHANGE_FEATURE,
  AutomationChangeFeature,
} from 'features/automation/protection/common/UITypes/AutomationFeatureChange'
// import { useObservable } from 'helpers/observableHook'
import { useUIChanges } from 'helpers/uiChangesHook'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  isAutoBuyOn: boolean
  vault: Vault
  addBasicBuyTriggerConfig: RetryableLoadingButtonProps
}

export function SidebarSetupAutoBuy({
  isAutoBuyOn,
  // vault,
  addBasicBuyTriggerConfig,
}: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()
  // const { uiChanges /*, txHelpers$*/ } = useAppContext()
  // TODO ŁW change to useUIChanges
  // const [activeAutomationFeature] = useObservable(
  //   uiChanges.subscribe<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE),
  // )
  const [activeAutomationFeature] = useUIChanges<AutomationChangeFeature>(AUTOMATION_CHANGE_FEATURE)

  if (isAutoBuyOn || activeAutomationFeature?.currentOptimizationFeature === 'autoBuy') {
    const sidebarSectionProps: SidebarSectionProps = {
      title: t('auto-buy.form-title'),
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
        disabled: false,
        action: () => {
          addBasicBuyTriggerConfig.onClick(() => null)
        },
      },
    }

    return <SidebarSection {...sidebarSectionProps} />
  }
  return null
}
