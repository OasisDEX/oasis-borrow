import { WithConnection } from 'components/connectWallet'
import { WithFeatureToggleRedirect } from 'components/FeatureToggleRedirect'
import { ProductPagesLayout } from 'components/Layouts'
import { ProductType } from 'features/oasisCreate/types'
import { OasisCreateView } from 'features/oasisCreate/views/OasisCreateView'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

function OasisCreatePage({ product }: { product: ProductType }) {
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
      ?.map((locale) =>
        Object.values(ProductType).map((product) => ({ params: { product }, locale })),
      )
      .flat() || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const isOasisCreateProduct = Object.values(ProductType).includes(params?.product as ProductType)

  return {
    ...(!isOasisCreateProduct && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(isOasisCreateProduct && { product: params?.product }),
    },
  }
}
