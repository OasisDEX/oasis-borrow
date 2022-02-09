import React from 'react'

import { VaultType } from '../generalManageVault/vaultType'
import { VaultHistoryEvent } from './vaultHistory'
import { VaultHistoryView } from './VaultHistoryView'

interface VaultHistoryProps {
  vaultHistory: VaultHistoryEvent[]
  vaultMultiplyHistory: VaultHistoryEvent[]
  vaultType: VaultType
}

export function VaultHistoryDetailsControl({
  vaultHistory,
  vaultMultiplyHistory,
  vaultType,
}: VaultHistoryProps) {
  switch (vaultType) {
    case VaultType.Borrow:
      return <VaultHistoryView vaultHistory={vaultHistory} />
    case VaultType.Multiply:
      return <VaultHistoryView vaultHistory={vaultMultiplyHistory} />
    default:
      return null
  }
}
