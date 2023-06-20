import { ALL_ASSETS, productHubOptionsMap } from 'features/productHub/meta'
import { ProductHubProductType } from 'features/productHub/types'
import ProductHubRouteHandler from 'features/productHub/views/ProductHubRouteHandler'
import { GetStaticPaths } from 'next'
import { getStaticProps as indexGetStaticProps } from 'pages/[networkOrProduct]/index'

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

  console.log('paths', JSON.stringify(paths, null, 2))

  return {
    paths,
    fallback: false,
  }
}

// actual logic is in index.tsx
export const getStaticProps = indexGetStaticProps
