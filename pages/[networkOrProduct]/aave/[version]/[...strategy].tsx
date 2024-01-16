import type { NetworkNames } from 'blockchain/networks'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { AppLayout } from 'components/layouts/AppLayout'
import { isSupportedStrategy } from 'features/aave'
import { OmniKitAaveContainer } from 'features/aave/containers/OmniKitAaveContainer'
import { XStateContainer } from 'features/aave/containers/xStateContainer'
import { isAaveLikeSimpleEarn } from 'features/aave/helpers/isAaveLikeSimpleEarn'
import type { ProductType } from 'features/aave/types'
import { getOmniServerSideProps } from 'features/omni-kit/server'
import type { OmniProductPage, OmniSupportedProtocols } from 'features/omni-kit/types'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import type { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { useRouter } from 'next/router'
import React from 'react'

interface OpenPositionProps extends OmniProductPage {
  network: NetworkNames
  protocol: LendingProtocol
  product: ProductType
  strategy: string
}

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const networkOrProduct = query.networkOrProduct as string
  const [product, strategy] = query.strategy as string[]
  const version = query.version as string
  const protocol = `aave${version.toLowerCase()}`

  const [supported] = isSupportedStrategy(networkOrProduct, protocol, product, strategy)
  if (supported) {
    return {
      props: {
        network: networkOrProduct,
        protocol,
        product,
        strategy,
        ...(
          await getOmniServerSideProps({
            locale,
            protocol: protocol as OmniSupportedProtocols,
            query: {
              position: query.strategy,
              networkOrProduct,
            },
          })
        ).props,
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

function OpenPosition({ network, protocol, product, strategy, ...props }: OpenPositionProps) {
  const { replace } = useRouter()

  const [supported, definedStrategy] = isSupportedStrategy(network, protocol, product, strategy)
  if (!supported) {
    return void replace(INTERNAL_LINKS.notFound)
  }

  if (isAaveLikeSimpleEarn(definedStrategy)) {
    return (
      <AppLayout>
        <ProductContextHandler>
          <OmniKitAaveContainer product={product} definedStrategy={definedStrategy} {...props} />
        </ProductContextHandler>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <ProductContextHandler>
        <XStateContainer product={product} definedStrategy={definedStrategy} {...props} />
      </ProductContextHandler>
    </AppLayout>
  )
}

export default OpenPosition
