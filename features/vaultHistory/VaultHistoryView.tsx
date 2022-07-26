import { useAppContext } from 'components/AppContextProvider'
import { DefinitionList } from 'components/DefinitionList'
import { useObservable } from 'helpers/observableHook'
import { flatten } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Heading } from 'theme-ui'

import { mapAutomationEvents, splitEvents, VaultHistoryEvent } from './vaultHistory'
import { VaultHistoryEntry } from './VaultHistoryEntry'

export function VaultHistoryView({ vaultHistory }: { vaultHistory: VaultHistoryEvent[] }) {
  const { context$ } = useAppContext()
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
              etherscan={context?.etherscan}
              ethtx={context?.ethtx}
              key={`${item.id}-${item.splitId || item.hash}`}
            />
          ))}
        </DefinitionList>
      </Card>
    </>
  )
}
