import { ProductHubProductType } from 'features/productHub/types'
import ProductHubRouteHandler from 'features/productHub/views/ProductHubRouteHandler'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default ProductHubRouteHandler

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      Object.values(ProductHubProductType).flatMap((product) => ({
        params: {
          networkOrProduct: product,
        },
        locale,
      })),
    ) || []

  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const product = params?.networkOrProduct as ProductHubProductType
  const token = params?.token
  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(product && { product }),
      ...(token && { token }),
    },
  }
}
