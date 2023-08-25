import { NetworkNames } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { DeferedContextProvider } from 'components/DeferedContextProvider'
import { AppLayout } from 'components/Layouts'
import { aaveContext, AaveContextProvider, isSupportedStrategy } from 'features/aave'
import { AaveOpenView } from 'features/aave/open/containers/AaveOpenView'
import { getSurveyType, ProductType } from 'features/aave/types'
import { Survey } from 'features/survey'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { LendingProtocol } from 'lendingProtocols'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
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

  return (
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
  )
}

OpenPosition.layout = AppLayout
export default OpenPosition
