import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { useObservable } from 'helpers/observableHook'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'

// TODO Move this to /features
function Summary({ address }: { address: string }) {
  const { vaultsOverview$, context$ } = useAppContext()
  const vaultsOverview = useObservable(vaultsOverview$(address))
  const context = useObservable(context$)

  if (vaultsOverview === undefined || context === undefined) {
    return null
  }

  return <VaultsOverviewView vaultsOverview={vaultsOverview} context={context} address={address} />
}

export async function getServerSideProps(ctx: any) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

export default function VaultsSummary({ address }: { address: string }) {
  return address ? (
    <WithConnection>
      <WithTermsOfService>
        <Summary {...{ address }} />
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
}
