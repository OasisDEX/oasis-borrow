import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { OpenVaultModal } from 'features/openVault/openVaultView'
import { useRouter } from 'next/router'
import React from 'react'

export default function OpenVault() {
  const router = useRouter()

  const ilk = router.query.ilk as string
  return (
    <WithWalletConnection>
      <OpenVaultModal ilk={ilk} close={() => {}} />
    </WithWalletConnection>
  )
}

OpenVault.layout = AppLayout
OpenVault.layoutProps = {
  variant: 'daiContainer',
}
