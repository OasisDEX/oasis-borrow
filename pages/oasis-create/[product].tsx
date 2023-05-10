import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { ProductPagesLayout } from 'components/Layouts'
import { OasisCreateView } from 'features/oasisCreate/views/OasisCreateView'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

export const oasisCreateProducts = ['borrow', 'multiply', 'earn'] as const
export type OasisCreateProduct = (typeof oasisCreateProducts)[number]

function OasisCreatePage({ product }: { product: OasisCreateProduct }) {
  return (
    <WithConnection>
      <WithFeatureToggleRedirect feature="OasisCreate">
        <OasisCreateView product={product} />
      </WithFeatureToggleRedirect>
    </WithConnection>
  )
}

OasisCreatePage.layout = ProductPagesLayout

export default OasisCreatePage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales
      ?.map((locale) => oasisCreateProducts.map((product) => ({ params: { product }, locale })))
      .flat() || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const isOasisCreateProduct = oasisCreateProducts.includes(params?.product as OasisCreateProduct)

  return {
    ...(!isOasisCreateProduct && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(isOasisCreateProduct && { product: params?.product }),
    },
  }
}
