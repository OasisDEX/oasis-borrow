import { products, tokens } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaProductController } from 'features/ajna/controls/AjnaProductController'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaOpenPositionProps {
  collateralToken: string
  quoteToken: string
  product: AjnaProduct
}

function AjnaOpenPositionPage({ collateralToken, quoteToken, product }: AjnaOpenPositionProps) {
  return (
    <AjnaProductController
      collateralToken={collateralToken}
      flow="open"
      product={product}
      quoteToken={quoteToken}
    />
  )
}

AjnaOpenPositionPage.layout = AjnaLayout
AjnaOpenPositionPage.seoTags = ajnaPageSeoTags

export default AjnaOpenPositionPage

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  return {
    paths:
      locales
        ?.map((locale) =>
          products.map((product) =>
            Object.keys(tokens[product as keyof typeof tokens]).map((collateralToken) =>
              // TODO: update to formula that doesn't require @ts-ignore when final version of white-listing is available
              // @ts-ignore
              tokens[product][collateralToken].map((quoteToken) => ({
                locale,
                params: { pair: `${collateralToken}-${quoteToken}`, product },
              })),
            ),
          ),
        )
        .flat(3) ?? [],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const pair = (params?.pair as string).split('-')

  return {
    ...(!products.includes(params?.product as string) && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      collateralToken: pair[0],
      quoteToken: pair[1],
      ...params,
    },
  }
}
