import { VaultProxyStatusCard } from 'components/vault/VaultProxy'
import { pick } from 'helpers/pick'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function StatusCard() {
  const {
    stage,
    proxyConfirmations,
    safeConfirmations,
    proxyTxHash,
    etherscan,
  } = useSelectFromContext(OpenBorrowVaultContext, (ctx) => ({
    ...pick(ctx, 'stage', 'proxyConfirmations', 'safeConfirmations', 'proxyTxHash', 'etherscan'),
  }))

  return (
    <VaultProxyStatusCard
      stage={stage}
      proxyConfirmations={proxyConfirmations}
      safeConfirmations={safeConfirmations}
      proxyTxHash={proxyTxHash}
      etherscan={etherscan}
    />
  )
}
