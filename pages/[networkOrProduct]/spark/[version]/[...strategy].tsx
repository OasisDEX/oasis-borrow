import type { NetworkNames } from 'blockchain/networks'
import { getNetworkByName } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/context/DeferedContextProvider'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { aaveContext, AaveContextProvider, isSupportedStrategy } from 'features/aave'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import type { ProductType } from 'features/aave/types'
import { getSurveyType } from 'features/aave/types'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { BackgroundLight } from 'theme/BackgroundLight'

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const networkOrProduct = ctx.query.networkOrProduct as string
  const [product, strategy] = ctx.query.strategy as string[]
  const version = ctx.query.version as string
  const protocol = `spark${version.toLowerCase()}`

  const [supported] = isSupportedStrategy(networkOrProduct, protocol, product, strategy)
  if (supported) {
    return {
      props: {
        ...(await serverSideTranslations(ctx.locale!, ['common'])),
        network: networkOrProduct,
        protocol: protocol,
        product: product,
        strategy: strategy,
      },
    }
  }

  return {
    redirect: {
      permanent: false,
      destination: '/not-found',
    },
  }
}

function OpenPosition({
  network,
  protocol,
  product,
  strategy,
}: {
  network: NetworkNames
  protocol: LendingProtocol
  product: ProductType
  strategy: string
}) {
  const { replace } = useRouter()

  const [supported, definedStrategy] = isSupportedStrategy(network, protocol, product, strategy)
  if (!supported) {
    return void replace(INTERNAL_LINKS.notFound)
  }
  const networkConfig = getNetworkByName(network)

  return (
    <AppLayout>
      <ProductContextHandler networkId={networkConfig.id}>
        <GasEstimationContextProvider>
          <AaveContextProvider>
            <WithConnection>
              <WithTermsOfService>
                <BackgroundLight />
                <DeferedContextProvider context={aaveContext}>
                  <AaveOpenView config={definedStrategy} />
                </DeferedContextProvider>
                <Survey for={getSurveyType(product)} />
              </WithTermsOfService>
            </WithConnection>
          </AaveContextProvider>
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AppLayout>
  )
}

export default OpenPosition
