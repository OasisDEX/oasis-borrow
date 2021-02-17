import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultView } from 'features/openVault/openVaultView'
import { useRouter } from 'next/router'
import React from 'react'

export default function OpenVault() {
  const router = useRouter()

  const ilk = router.query.ilk as string
  return (
    <WithWalletConnection>
      <OpenVaultView ilk={ilk} />
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
