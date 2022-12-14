import { amountFromWei } from '@oasisdex/utils'
import { DefinitionList } from 'components/DefinitionList'
import { DefaultVaultLayout } from 'components/vault/DefaultVaultLayout'
import { DsrEvent } from 'features/dsr/helpers/dsrHistory'
import { VaultHistoryEntry } from 'features/vaultHistory/VaultHistoryEntry'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading } from 'theme-ui'

function DsrHistoryView({ history }: { history?: DsrEvent[] }) {
  const { t } = useTranslation()
  const etherscan = 'https://etherscan.io'
  const ethtx = 'https://ethtx.info'

  return (
    <Card
      sx={{
        p: 4,
        border: 'lightMuted',
      }}
    >
      <Heading variant="headerSettings" sx={{ mb: 3 }}>
        {t('vault-history')}
      </Heading>
      <DefinitionList>
        {history &&
          history.map((item, idx) => (
            <VaultHistoryEntry
              item={{
                token: 'DAI',
                hash: item.txHash,
                ...item,
                daiAmount: amountFromWei(item.amount),
                // @ts-ignore
                timestamp: item.timestamp * 1000,
              }}
              etherscan={{ url: etherscan }}
              ethtx={{ url: ethtx }}
              e
              key={idx}
            />
          ))}
      </DefinitionList>
    </Card>
  )
}

export function DsrHistory({ history }: { history: DsrEvent[] }) {
  return <DefaultVaultLayout detailsViewControl={<DsrHistoryView history={history} />} />
}
