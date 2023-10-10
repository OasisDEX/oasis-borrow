import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { useMainContext } from 'components/context'
import { DefinitionList } from 'components/DefinitionList'
import { useObservable } from 'helpers/observableHook'
import { flatten } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading } from 'theme-ui'

import { mapAutomationEvents, splitEvents } from './vaultHistory'
import type { VaultHistoryEvent } from './vaultHistory.types'
import { VaultHistoryEntry } from './VaultHistoryEntry'

export function VaultHistoryView({ vaultHistory }: { vaultHistory: VaultHistoryEvent[] }) {
  const { context$ } = useMainContext()
  const [context] = useObservable(context$)
  const { t } = useTranslation()

  const mappedAuto = mapAutomationEvents(vaultHistory)
  const spitedEvents = flatten(mappedAuto.map(splitEvents))

  return (
    <>
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
          {spitedEvents.map((item) => (
            <VaultHistoryEntry
              item={item}
              etherscan={
                context
                  ? getNetworkContracts(NetworkIds.MAINNET, context.chainId).etherscan
                  : undefined
              }
              ethtx={
                context ? getNetworkContracts(NetworkIds.MAINNET, context.chainId).ethtx : undefined
              }
              key={`${item.id}-${item.splitId || item.hash}`}
            />
          ))}
        </DefinitionList>
      </Card>
    </>
  )
}
