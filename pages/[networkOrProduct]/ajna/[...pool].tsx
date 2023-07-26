import { getNetworkContracts } from 'blockchain/contracts'
import { isSupportedNetwork, NetworkIds } from 'blockchain/networks'
import { isAddress } from 'ethers/lib/utils'
import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductController } from 'features/ajna/positions/common/controls/AjnaProductController'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaOpenPositionPageProps {
  product: AjnaProduct
  collateralToken: string
  quoteToken: string
}

function AjnaOpenPositionPage({ product, collateralToken, quoteToken }: AjnaOpenPositionPageProps) {
  return (
    <AjnaProductController
      collateralToken={collateralToken}
      flow="open"
      product={product}
      quoteToken={quoteToken}
    />
  )
}

AjnaOpenPositionPage.layout = AjnaLayout
AjnaOpenPositionPage.seoTags = ajnaPageSeoTags

export default AjnaOpenPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const network = query.networkOrProduct as string
  const [product, pool] = query.pool as string[]
  const [collateralToken, quoteToken] = pool.split('-')
  const supportedPools = Object.keys({
    ...getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs,
    ...getNetworkContracts(NetworkIds.GOERLI).ajnaPoolPairs,
  })

  if (
    isSupportedNetwork(network) &&
    ajnaProducts.includes(product as AjnaProduct) &&
    (supportedPools.includes(pool) || (isAddress(collateralToken) && isAddress(quoteToken)))
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        product,
        collateralToken,
        quoteToken,
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
