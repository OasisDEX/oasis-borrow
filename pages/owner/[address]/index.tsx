import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservableWithError } from 'helpers/observableHook'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

import { WithTermsOfService } from '../../../features/termsOfService/TermsOfService'

// TODO Move this to /features
function Summary({ address }: { address: string }) {
  const { vaultsOverview$, context$ } = useAppContext()
  const vaultsOverviewWithError = useObservableWithError(vaultsOverview$(address))
  const contextWithError = useObservableWithError(context$)

  return (
    <WithErrorHandler error={[vaultsOverviewWithError.error, contextWithError.error]}>
      <WithLoadingIndicator value={[vaultsOverviewWithError.value, contextWithError.value]}>
        {([vaultsOverview, context]) => (
          <VaultsOverviewView vaultsOverview={vaultsOverview} context={context} address={address} />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
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
        <BackgroundLight />
        <Summary address={address} />
      </WithTermsOfService>
    </WithConnection>
  ) : null
}

VaultsSummary.layout = AppLayout
VaultsSummary.layoutProps = {
  variant: 'daiContainer',
}
