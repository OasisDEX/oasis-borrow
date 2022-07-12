import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { AppLayout } from 'components/Layouts'
import { getAddress } from 'ethers/lib/utils'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { VaultsOverviewView } from 'features/vaultsOverview/VaultOverviewView'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
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
  const {
    vaultsOverview$,
    context$,
    productCardsWithBalance$,
    accountData$,
    positionsOverviewSummary$,
  } = useAppContext()
  const checksumAddress = getAddress(address.toLocaleLowerCase())

  const [productCardsDataValue, productCardsDataError] = useObservable(productCardsWithBalance$)
  const [vaultsOverview, vaultsOverviewError] = useObservable(vaultsOverview$(checksumAddress))
  const [context, contextError] = useObservable(context$)
  const [accountData, accountDataError] = useObservable(accountData$)
  const [positionsOverviewSummary, positionOverviewSummaryError] = useObservable(
    positionsOverviewSummary$(checksumAddress),
  )

  return (
    <WithErrorHandler
      error={[
        vaultsOverviewError,
        contextError,
        productCardsDataError,
        accountDataError,
        positionOverviewSummaryError,
      ]}
    >
      <WithLoadingIndicator
        value={[vaultsOverview, context, productCardsDataValue, positionsOverviewSummary]}
      >
        {([_vaultsOverview, _context, _productCardsDataValue, _positionsOverviewSummary]) => (
          <VaultsOverviewView
            vaultsOverview={_vaultsOverview}
            context={_context}
            address={checksumAddress}
            ensName={accountData?.ensName}
            productCardsData={_productCardsDataValue}
            topAssetsAndPositions={_positionsOverviewSummary}
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
