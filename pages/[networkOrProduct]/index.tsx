import { AnimatedWrapper } from 'components/AnimatedWrapper'
import { WithConnection } from 'components/connectWallet'
import { AppLayout } from 'components/layouts/AppLayout'
import { ProductHubProductType } from 'features/productHub/types'
import { ProductHubView } from 'features/productHub/views'
import { useAppConfig } from 'helpers/config'
import { useScrollToTop } from 'helpers/useScrollToTop'
import type { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface ProductHubPageProps {
  product: ProductHubProductType
}

function ProductHubPage({ product }: ProductHubPageProps) {
  const { AjnaSafetySwitch: ajnaSafetySwitchOn } = useAppConfig('features')

  useScrollToTop(product)

  return (
    <AppLayout>
      <WithConnection>
        <AnimatedWrapper sx={{ mb: 5 }}>
          <ProductHubView
            product={product}
            promoCardsCollection={ajnaSafetySwitchOn ? 'Home' : 'HomeWithAjna'}
            url="/"
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
      Object.values(ProductHubProductType).flatMap((product) => ({
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
