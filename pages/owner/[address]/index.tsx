import { TokenBalances } from 'blockchain/tokens'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { getAddress } from 'ethers/lib/utils'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultsOverviewView'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useEffect, useState } from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  return {
    props: {
      ...(await serverSideTranslations(ctx.locale!, ['common'])),
      address: ctx.query?.address || null,
    },
  }
}

// TODO Move this to /features
function Summary({ address }: { address: string }) {
  const [tokenBalances, setBalances] = useState<TokenBalances | undefined>(undefined)
  const {
    vaultsOverview$,
    context$,
    productCardsData$,
    connectedContext$,
    accountBalances$,
    ilkData$,
  } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())

  const [connectedContext] = useObservable(connectedContext$)
  const [ilkData] = useObservable(ilkData$('ETH-A'))
  const [productCardsDataValue, productCardsDataError] = useObservable(productCardsData$)
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))
  const [context, contextError] = useObservable(context$)
  console.log("ilkData['ETH-A']", ilkData)
  console.log('context', context)
  useEffect(() => {
    if (!connectedContext?.account) return

    const subscription = accountBalances$(connectedContext?.account).subscribe((v: TokenBalances) =>
      setBalances(v),
    )
    return () => subscription.unsubscribe()
  }, [connectedContext?.account])

  return (
    <WithErrorHandler error={[vaultsOverviewError, contextError, productCardsDataError]}>
      <WithLoadingIndicator value={[vaultsOverview, context, productCardsDataValue]}>
        {([vaultsOverview, context, productCardsDataValue]) => (
          <VaultsOverviewView
            vaultsOverview={vaultsOverview}
            context={context}
            address={checksumAddress}
            productCardsData={productCardsDataValue}
            tokenBalances={tokenBalances}
          />
        )}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}

function VaultsSummary({ address }: { address: string }) {
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

export default VaultsSummary
