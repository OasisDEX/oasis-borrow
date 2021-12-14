import { VaultAllowanceStatus } from 'components/vault/VaultAllowance'
import { pick } from 'helpers/pick'
import { useSelectFromContext } from 'helpers/useSelectFromContext'
import React from 'react'

import { OpenBorrowVaultContext } from '../OpenVaultView'

export function AllowanceStatus() {
  const { stage, token, etherscan, allowanceTxHash } = useSelectFromContext(
    OpenBorrowVaultContext,
    (ctx) => ({
      ...pick(ctx, 'stage', 'token', 'etherscan', 'allowanceTxHash'),
    }),
  )
  return (
    <VaultAllowanceStatus
      stage={stage}
      allowanceTxHash={allowanceTxHash}
      etherscan={etherscan}
      token={token}
    />
  )
}
