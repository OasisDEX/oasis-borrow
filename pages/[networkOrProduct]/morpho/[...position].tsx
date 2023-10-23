import type { MorphoPosition } from '@oasisdex/dma-library'
import { isSupportedNetwork, NetworkNames } from 'blockchain/networks'
import { GasEstimationContextProvider } from 'components/context/GasEstimationContextProvider'
import { ProductContextHandler } from 'components/context/ProductContextHandler'
import { isPoolOracless } from 'features/ajna/common/helpers/isOracless'
import { morphoOmniSteps, morphoSeoTags, morphoSupportedPairs } from 'features/morpho/common/consts'
import { MorphoLayout, morphoPageSeoTags } from 'features/morpho/common/layout'
import type { MorphoPositionAuction } from 'features/morpho/common/types'
import { MorphoProductController } from 'features/morpho/controllers/MorphoProductController'
import { OmniProductController } from 'features/omni-kit/controllers'
import { useMorphoOmniData } from 'features/omni-kit/protocols/morpho-blue/hooks/useMorphoOmniData'
import type { OmniProduct } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { LendingProtocol } from 'lendingProtocols'
import type { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface MorphoPositionPageProps {
  id: string
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
          <OmniProductController<MorphoPositionAuction, PositionHistoryEvent[], MorphoPosition>
            collateralToken={collateralToken}
            flow={id ? 'manage' : 'open'}
            id={id}
            product={product}
            quoteToken={quoteToken}
            protocol={LendingProtocol.MorphoBlue}
            controller={MorphoProductController}
            protocolHook={useMorphoOmniData}
            isOracless={isOracless}
            seoTags={morphoSeoTags}
            steps={morphoOmniSteps}
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
  const [product, tokenPair, id = null] = query.position as string[]
  const [collateralToken, quoteToken] = tokenPair.split('-')

  const caseSensitiveCollateralToken = collateralToken.toUpperCase()
  const caseSensitiveQuoteToken = quoteToken.toUpperCase()

  if (
    isSupportedNetwork(network) &&
    network === NetworkNames.ethereumMainnet &&
    ['borrow', 'multiply'].includes(product as OmniProduct) &&
    morphoSupportedPairs.includes(`${collateralToken.toUpperCase()}-${quoteToken.toUpperCase()}`)
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        product,
        collateralToken: caseSensitiveCollateralToken,
        quoteToken: caseSensitiveQuoteToken,
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
