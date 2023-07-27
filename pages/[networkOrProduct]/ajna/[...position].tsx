import { getNetworkContracts } from 'blockchain/contracts'
import { isSupportedNetwork, NetworkIds, NetworkNames } from 'blockchain/networks'
import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductController } from 'features/ajna/positions/common/controls/AjnaProductController'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaPositionPageProps {
  id: string
  pool: string
  product: AjnaProduct
}

function AjnaPositionPage({ id, pool, product }: AjnaPositionPageProps) {
  const [collateralToken, quoteToken] = pool.split('-')

  return (
    <AjnaProductController
      collateralToken={collateralToken}
      flow={id ? 'manage' : 'open'}
      id={id}
      product={product}
      quoteToken={quoteToken}
    />
  )
}

AjnaPositionPage.layout = AjnaLayout
AjnaPositionPage.seoTags = ajnaPageSeoTags

export default AjnaPositionPage

export async function getServerSideProps({ locale, query }: GetServerSidePropsContext) {
  const network = query.networkOrProduct as string
  const [product, pool, id = null] = query.position as string[]
  const supportedPools = Object.keys({
    ...getNetworkContracts(NetworkIds.MAINNET).ajnaPoolPairs,
    ...getNetworkContracts(NetworkIds.GOERLI).ajnaPoolPairs,
  })

  if (
    isSupportedNetwork(network) &&
    network === NetworkNames.ethereumMainnet &&
    ajnaProducts.includes(product as AjnaProduct) &&
    supportedPools.includes(pool)
  ) {
    return {
      props: {
        ...(await serverSideTranslations(locale || 'en', ['common'])),
        product,
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
