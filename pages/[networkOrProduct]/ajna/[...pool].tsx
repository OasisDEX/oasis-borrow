import { getNetworkContracts } from 'blockchain/contracts'
import { isSupportedNetwork, NetworkIds } from 'blockchain/networks'
import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductController } from 'features/ajna/positions/common/controls/AjnaProductController'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaOpenPositionPageProps {
  pool: string
  product: AjnaProduct
}

function AjnaOpenPositionPage({ pool, product }: AjnaOpenPositionPageProps) {
  const [collateralToken, quoteToken] = pool.split('-')

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
  const supportedPools = Object.keys({
    ...getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs,
    ...getNetworkContracts(NetworkIds.GOERLI).ajnaPoolPairs,
  })

  if (
    isSupportedNetwork(network) &&
    ajnaProducts.includes(product as AjnaProduct) &&
    supportedPools.includes(pool)
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        product,
        pool,
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
