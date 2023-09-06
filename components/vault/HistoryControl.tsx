import React from 'react'
import { Icon } from '@makerdao/dai-ui-icons'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import { useTranslation } from 'next-i18next'

interface HistoryControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function HistoryControl({ vaultHistory }: HistoryControlProps) {
  return (
    <DefaultVaultLayout detailsViewControl={<VaultHistoryView vaultHistory={vaultHistory} />} />
  )
}

export function DisabledHistoryControl() {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={t('vault-banners.history-coming-soon.header')}
      subheader={t('vault-banners.history-coming-soon.description')}
      color="primary100"
    />
  )
}
