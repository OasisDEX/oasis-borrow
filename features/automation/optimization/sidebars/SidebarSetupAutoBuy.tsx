import { Vault } from 'blockchain/vaults'
import { SidebarSection } from 'components/sidebar/SidebarSection'
import { MultipleRangeSlider } from 'components/vault/MultipleRangeSlider'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid } from 'theme-ui'

interface SidebarSetupAutoBuyProps {
  vault: Vault
}

export function SidebarSetupAutoBuy({ vault }: SidebarSetupAutoBuyProps) {
  const { t } = useTranslation()

  return (
    <SidebarSection
      title={`Auto Buy Setup #${vault.id.toNumber()}`}
      content={
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
              value0: 'red',
              value1: 'blue',
            }}
            leftDescription={t('auto-buy.target-coll-ratio')}
            rightDescription={t('auto-buy.target-coll-ratio')}
          />
        </Grid>
      }
      primaryButton={{
        label: 'Confirm',
        disabled: true,
      }}
    />
  )
}
