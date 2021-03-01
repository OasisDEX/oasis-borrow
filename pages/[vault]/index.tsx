import BigNumber from 'bignumber.js'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { ManageVaultView } from 'features/manageVault/manageVaultView'
import { useRouter } from 'next/router'
import React from 'react'

export default function Vault() {
  const {
    query: { vault: vaultId },
  } = useRouter()

  return (
    <WithConnection>
      <ManageVaultView id={new BigNumber(vaultId as string)} />
    </WithConnection>
  )
}

Vault.layout = AppLayout
