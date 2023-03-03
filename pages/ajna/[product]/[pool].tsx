import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductController } from 'features/ajna/positions/common/controls/AjnaProductController'
import { GetServerSidePropsContext } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaOpenPositionProps {
  collateralToken: string
  quoteToken: string
  product: AjnaProduct
}

function AjnaOpenPositionPage({ collateralToken, quoteToken, product }: AjnaOpenPositionProps) {
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
  const pool = (query.pool as string).split('-')

  return {
    ...(!ajnaProducts.includes(query.product as AjnaProduct) && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      collateralToken: pool[0],
      quoteToken: pool[1],
      product: query.product,
    },
  }
}
