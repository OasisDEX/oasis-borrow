import { PageSEOTags } from 'components/HeadTags'
import { ajnaProducts } from 'features/ajna/common/consts'
import { AjnaSelectorController } from 'features/ajna/common/controls/AjnaSelectorController'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { upperFirst } from 'lodash'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaProductSelectorPageProps {
  product: AjnaProduct
}

function AjnaProductSelectorPage({ product }: AjnaProductSelectorPageProps) {
  return (
    <>
      <PageSEOTags
        title="seo.ajnaProductPage.title"
        titleParams={{ product: upperFirst(product) }}
        description="seo.ajna.description"
        url={`/ajna/${product}`}
      />
      <AjnaSelectorController key={product} product={product} />
    </>
  )
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
