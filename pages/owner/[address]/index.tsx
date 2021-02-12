import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { useObservable } from 'helpers/observableHook'
import { useRouter } from 'next/router'
import React from 'react'

function Summary({ address }: { address: string }) {
  const { vaultsOverview$ } = useAppContext()
  const vaultsOverview = useObservable(vaultsOverview$(address))

  if (vaultsOverview === undefined) {
    return null
  }

  return <VaultsOverviewView {...vaultsOverview} />
}

export default function VaultsSummary() {
  const router = useRouter();

  const address = router.query.address as string
  return address ? <WithConnection><Summary {...{ address }} /></WithConnection> : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
}
