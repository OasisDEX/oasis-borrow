import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import ProductHubRouteHandler from 'features/productHub/views/ProductHubRouteHandler'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default ProductHubRouteHandler

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const paths =
    locales?.flatMap((locale) =>
      Object.values(ProductHubProductType)
        .flatMap((product) =>
          Object.values(productHubOptionsMap[product].tokens).map((token) =>
            token.value !== ALL_ASSETS
              ? [product, ...(token.value !== ALL_ASSETS ? [token.value] : [])]
              : undefined,
          ),
        )
        .filter((param) => param !== undefined)
        .map((param) => ({
          params: {
            networkOrProduct: param![0],
            token: param![1],
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
