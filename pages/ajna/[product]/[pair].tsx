import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { AjnaOpenBorrowView } from 'features/ajna/borrow/AjnaOpenBorrowView'
import { products, tokens } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'

interface AjnaProductFlowPageProps {
  collateralToken: string
  quoteToken: string
  product: string
}

function AjnaProductFlowPage({ collateralToken, quoteToken, product }: AjnaProductFlowPageProps) {
  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          {product === 'borrow' && (
            <AjnaOpenBorrowView collateralToken={collateralToken} quoteToken={quoteToken} />
          )}
        </AjnaWrapper>
      </WithTermsOfService>
    </WithWalletConnection>
  )
}

AjnaProductFlowPage.layout = AjnaLayout
AjnaProductFlowPage.seoTags = ajnaPageSeoTags

export default AjnaProductFlowPage

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
