import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts/AppLayout'
import { OmniProductType } from 'features/omni-kit/types'
import { featuredProducts } from 'features/productHub/meta'
import { ProductHubView } from 'features/productHub/views'
import { productHubDefaultFilters } from 'helpers/productHubDefaultFilters'
import { useScrollToTop } from 'helpers/useScrollToTop'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface ProductHubPageProps {
  product: OmniProductType
}

function ProductHubPage({ product }: ProductHubPageProps) {
  useScrollToTop(product)

  return (
    <AppLayout>
      <WithConnection>
        <AnimatedWrapper sx={{ mb: 5 }}>
          <ProductHubView
            featured={{
              products: featuredProducts,
              limit: 1,
              isTagged: true,
              isHighlighted: true,
              isPromoted: true,
            }}
            perPage={20}
            product={product}
            url="/"
            initialFilters={productHubDefaultFilters}
          />
        </AnimatedWrapper>
      </WithConnection>
    </AppLayout>
  )
}

export default ProductHubPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      Object.values(OmniProductType).flatMap((product) => ({
        params: { networkOrProduct: product },
        locale,
      })),
    ) ?? []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      product: params?.networkOrProduct,
    },
  }
}
