import ProductHubRouteHandler from 'features/productHub/views/ProductHubRouteHandler'
import {
  getStaticPaths as indexGetStaticPaths,
  getStaticProps as indexGetStaticProps,
} from 'pages/[networkOrProduct]/index'

export default ProductHubRouteHandler

// actual logic is in index.tsx

export const getStaticPaths = indexGetStaticPaths
export const getStaticProps = indexGetStaticProps
