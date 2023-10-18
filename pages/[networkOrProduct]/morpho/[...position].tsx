import { getNetworkContracts } from 'blockchain/contracts'
import { isSupportedNetwork, NetworkIds, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { isAddress } from 'ethers/lib/utils'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import type { AjnaGenericPosition } from 'features/ajna/common/types'
import type { AjnaUnifiedHistoryEvent } from 'features/ajna/history/ajnaUnifiedHistoryEvent'
import type { AjnaPositionAuction } from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
import { morphoSeoTags } from 'features/morpho/common/consts'
import { MorphoLayout, morphoPageSeoTags } from 'features/morpho/common/layout'
import { MorphoOmniProductController } from 'features/morpho/controllers/MorphoOmniProductController'
import { omniProducts } from 'features/omni-kit/common/consts'
import { OmniProductController } from 'features/omni-kit/controllers/common/OmniProductController'
import { useAjnaOmniData } from 'features/omni-kit/hooks/ajna/useAjnaOmniData'
import type { OmniProduct } from 'features/omni-kit/types/common.types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface MorphoPositionPageProps {
  id: string
  pool: string
  product: OmniProduct
  collateralToken: string
  quoteToken: string
}

function MorphoPositionPage({ id, product, collateralToken, quoteToken }: MorphoPositionPageProps) {
  const isOracless = !!(
    collateralToken &&
    quoteToken &&
    isPoolOracless({ collateralToken, quoteToken })
  )

  return (
    <MorphoLayout>
      <ProductContextHandler>
        <GasEstimationContextProvider>
          <OmniProductController<
            AjnaPositionAuction,
            AjnaUnifiedHistoryEvent[],
            AjnaGenericPosition
          >
            collateralToken={collateralToken}
            flow={id ? 'manage' : 'open'}
            id={id}
            product={product}
            quoteToken={quoteToken}
            protocol={LendingProtocol.MorphoBlue}
            controller={MorphoOmniProductController}
            protocolHook={useAjnaOmniData}
            isOracless={isOracless}
            seoTags={morphoSeoTags}
          />
        </GasEstimationContextProvider>
      </ProductContextHandler>
    </MorphoLayout>
  )
}

MorphoPositionPage.seoTags = morphoPageSeoTags

export default MorphoPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const network = query.networkOrProduct as string
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
    isSupportedNetwork(network) &&
    network === NetworkNames.ethereumMainnet &&
    omniProducts.includes(product as OmniProduct) &&
    (supportedPools.includes(`${caseSensitiveCollateralToken}-${caseSensitiveQuoteToken}`) ||
      (isAddress(caseSensitiveCollateralToken) && isAddress(caseSensitiveQuoteToken)))
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        product,
        collateralToken: caseSensitiveCollateralToken,
        quoteToken: caseSensitiveQuoteToken,
        pool,
        id,
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
