import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import React from 'react'

interface HistoryControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function HistoryControl({ vaultHistory }: HistoryControlProps) {
  return (
    <DefaultVaultLayout detailsViewControl={<VaultHistoryView vaultHistory={vaultHistory} />} />
  )
}
