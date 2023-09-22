import { Icon } from '@makerdao/dai-ui-icons'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import type { LendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface HistoryControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function HistoryControl({ vaultHistory }: HistoryControlProps) {
  return (
    <DefaultVaultLayout detailsViewControl={<VaultHistoryView vaultHistory={vaultHistory} />} />
  )
}

export function DisabledHistoryControl({ protocol }: { protocol: LendingProtocol }) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" name="warning" />}
      withClose={false}
      header={t('vault-banners.history-coming-soon.header')}
      subheader={t('vault-banners.history-coming-soon.description', {
        protocol: LendingProtocolLabel[protocol],
      })}
      color="primary100"
    />
  )
}
