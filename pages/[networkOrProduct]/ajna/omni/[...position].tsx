import { getNetworkContracts } from 'blockchain/contracts'
import { isSupportedNetwork, NetworkIds, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { isAddress } from 'ethers/lib/utils'
import { ajnaSeoTags } from 'features/ajna/common/consts'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { omniProducts, omniSteps } from 'features/omni-kit/constants'
import { OmniProductController } from 'features/omni-kit/controllers'
import { AjnaOmniProductController } from 'features/omni-kit/protocols/ajna/controllers/AjnaOmniProductController'
import { useAjnaOmniData } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniData'
import type { OmniProduct } from 'features/omni-kit/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaPositionPageProps {
  collateralToken: string
  id: string
  networkName: NetworkNames
  pool: string
  product: OmniProduct
  quoteToken: string
}

function AjnaPositionPage({
  collateralToken,
  id,
  networkName,
  product,
  quoteToken,
}: AjnaPositionPageProps) {
  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken })
  )

  return (
    <AjnaLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<
            AjnaPositionAuction,
            AjnaUnifiedHistoryEvent[],
            AjnaGenericPosition
          >
            collateralToken={collateralToken}
            controller={AjnaOmniProductController}
            flow={id ? 'manage' : 'open'}
            id={id}
            isOracless={isOracless}
            networkName={networkName}
            product={product}
            protocol={LendingProtocol.Ajna}
            protocolHook={useAjnaOmniData}
            quoteToken={quoteToken}
            seoTags={ajnaSeoTags}
            steps={omniSteps}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </AjnaLayout>
  )
}

AjnaPositionPage.seoTags = ajnaPageSeoTags

export default AjnaPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const networkName = query.networkOrProduct as NetworkNames
  const [product, pool, id = null] = query.position as string[]
  const [collateralToken, quoteToken] = pool.split('-')
  const caseSensitiveCollateralToken = isAddress(collateralToken)
    ? collateralToken.toLowerCase()
    : collateralToken.toUpperCase()
  const caseSensitiveQuoteToken = isAddress(quoteToken)
    ? quoteToken.toLowerCase()
    : quoteToken.toUpperCase()
  const supportedPools = Object.keys({
    ...getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs,
    ...getNetworkContracts(NetworkIds.GOERLI).ajnaPoolPairs,
  })

  if (
    isSupportedNetwork(networkName) &&
    networkName === NetworkNames.ethereumMainnet &&
    omniProducts.includes(product as OmniProduct) &&
    (supportedPools.includes(`${caseSensitiveCollateralToken}-${caseSensitiveQuoteToken}`) ||
      (isAddress(caseSensitiveCollateralToken) && isAddress(caseSensitiveQuoteToken)))
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        collateralToken: caseSensitiveCollateralToken,
        id,
        networkName,
        pool,
        product,
        quoteToken: caseSensitiveQuoteToken,
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
