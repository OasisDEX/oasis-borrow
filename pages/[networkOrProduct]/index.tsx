import { getProductHubStaticProps } from 'features/productHub/helpers/getProductHubStaticProps'
import { ProductHubProductType } from 'features/productHub/types'
import ProductHubRouteHandler from 'features/productHub/views/ProductHubRouteHandler'
import { GetStaticPaths, GetStaticProps } from 'next'

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
  return await getProductHubStaticProps(locale, params)
}
