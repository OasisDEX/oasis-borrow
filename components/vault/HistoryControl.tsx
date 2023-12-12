import type { NetworkNames } from 'blockchain/networks'
import { Icon } from 'components/Icon'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { VaultNotice } from 'features/notices/VaultsNoticesView'
import type { VaultHistoryEvent } from 'features/vaultHistory/vaultHistory.types'
import { VaultHistoryView } from 'features/vaultHistory/VaultHistoryView'
import type { LendingProtocol } from 'lendingProtocols'
import { LendingProtocolLabel } from 'lendingProtocols'
import { capitalize } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { warning } from 'theme/icons'

interface HistoryControlProps {
  vaultHistory: VaultHistoryEvent[]
}

export function HistoryControl({ vaultHistory }: HistoryControlProps) {
  return (
    <DefaultVaultLayout detailsViewControl={<VaultHistoryView vaultHistory={vaultHistory} />} />
  )
}

export function DisabledHistoryControl({
  protocol,
  networkName,
  proxyVersion,
}: {
  protocol: LendingProtocol
  networkName: NetworkNames
  proxyVersion: string
}) {
  const { t } = useTranslation()

  return (
    <VaultNotice
      status={<Icon size="34px" icon={warning} />}
      withClose={false}
      header={t('vault-banners.history-coming-soon.header')}
      subheader={t('vault-banners.history-coming-soon.description', {
        protocol: LendingProtocolLabel[protocol],
        network: capitalize(networkName),
        proxyVersion,
      })}
      color="primary100"
    />
  )
}
