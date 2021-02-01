import { useAppContext } from 'components/AppContextProvider'
import { AppLayout } from 'components/Layouts'
import { AccountOverviewView } from 'features/accountOverview/AccountOverviewView'

import { useObservable } from 'helpers/observableHook'
import React from 'react'
import {  Grid, Text } from 'theme-ui'

function ProxyOwner({ proxyAddress }: { proxyAddress: string }) {
  const { proxyOwner$ } = useAppContext()

  const proxyOwner = useObservable(proxyOwner$(proxyAddress))

  return <Text>{proxyOwner}</Text>
}

function Summary({ address }: { address: string }) {
  const {
    web3Context$,
    proxyAddress$,
    accountOverview$,
  } = useAppContext()
  const web3Context = useObservable(web3Context$)
  const proxyAddress = useObservable(proxyAddress$(address))

  const accountOverview = useObservable(accountOverview$(address))

  if (accountOverview === undefined) {
    return null
  }

  return (
    <Grid sx={{ flex: 1 }}>
      <Text>Connected Address :: {(web3Context as any)?.account}</Text>
      <Text>Viewing Address :: {address}</Text>
      <Text>ProxyAddress :: {proxyAddress}</Text>
      <Text>ProxyOwner :: {proxyAddress ? <ProxyOwner proxyAddress={proxyAddress} /> : null}</Text>
      <AccountOverviewView {...accountOverview} />
    </Grid>
  )
}

export default function VaultsSummary() {
  const { readonlyAccount$ } = useAppContext()

  const address = useObservable(readonlyAccount$)
  return address ? <Summary {...{ address }} /> : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
  backLink: {
    href: '/',
  },
}