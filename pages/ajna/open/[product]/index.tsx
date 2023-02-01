import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { products } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaSelectorController } from 'features/ajna/controls/AjnaSelectorController'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaProductSelectorPageProps {
  product: AjnaProduct
}

function AjnaProductSelectorPage({ product }: AjnaProductSelectorPageProps) {
  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <AjnaSelectorController product={product} />
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
  )
}

AjnaProductSelectorPage.layout = AjnaLayout
AjnaProductSelectorPage.seoTags = ajnaPageSeoTags

export default AjnaProductSelectorPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return {
    paths:
      locales
        ?.map((locale) => products.map((item) => ({ params: { product: item }, locale })))
        .flat() ?? [],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  return {
    ...(!products.includes(params?.product as string) && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      ...params,
    },
  }
}
