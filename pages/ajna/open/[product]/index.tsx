import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaSelectorController } from 'features/ajna/controls/AjnaSelectorController'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaProductSelectorPageProps {
  product: AjnaProduct
}

function AjnaProductSelectorPage({ product }: AjnaProductSelectorPageProps) {
  return <AjnaSelectorController product={product} />
}

AjnaProductSelectorPage.layout = AjnaLayout
AjnaProductSelectorPage.seoTags = ajnaPageSeoTags

export default AjnaProductSelectorPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return {
    paths:
      locales
        ?.map((locale) => ajnaProducts.map((item) => ({ params: { product: item }, locale })))
        .flat() ?? [],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  return {
    ...(!ajnaProducts.includes(params?.product as AjnaProduct) && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...params,
    },
  }
}
