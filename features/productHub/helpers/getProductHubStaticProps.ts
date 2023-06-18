import { ProductHubProductType } from 'features/productHub/types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ParsedUrlQuery } from 'querystring'

export async function getProductHubStaticProps(locale?: string, params?: ParsedUrlQuery) {
  const product = params?.slug![0] as ProductHubProductType
  const token = params?.slug![1]

  return {
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...(product && { product }),
      ...(token && { token }),
    },
  }
}
