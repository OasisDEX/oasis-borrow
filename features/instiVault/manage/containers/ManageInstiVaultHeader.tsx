import React from 'react'
import { DefaultVaultHeader, DefaultVaultHeaderProps } from 'components/vault/DefaultVaultHeader'
import { ManageVaultState } from 'features/borrow/manage/pipes/manageVault'
import { VaultIlkDetailsItem } from 'components/vault/VaultHeader'
import { useTranslation } from 'next-i18next'

export function ManageInstiVaultHeader(props: DefaultVaultHeaderProps) {
  const { ilkData, id } = props
  const { t } = useTranslation()
  return <DefaultVaultHeader header="Institutional Vault" ilkData={ilkData} id={id}>
    <VaultIlkDetailsItem
        label="Insti vault item"
        value="123"
        tooltipContent={t('manage-multiply-vault.tooltip.dust-limit')}
        styles={{
          tooltip: {
            left: ['-80px', 'auto'],
            right: ['auto', '-32px'],
          },
        }}
      />
  </DefaultVaultHeader>
}