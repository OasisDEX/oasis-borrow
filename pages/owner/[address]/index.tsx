import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { useObservable } from 'helpers/observableHook'
import React from 'react'

function Summary({ address }: { address: string }) {
  const { vaultsOverview$, } = useAppContext()

  const vaultsOverview = useObservable(vaultsOverview$(address))

  if (vaultsOverview === undefined) {
    return null
  }

  return <VaultsOverviewView {...vaultsOverview} />
}

export default function VaultsSummary() {
  const { readonlyAccount$ } = useAppContext()

  const address = useObservable(readonlyAccount$)
  return address ? <Summary {...{ address }} /> : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
}
