import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { products, tokens } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React from 'react'
import { Box } from 'theme-ui'

interface AjnaProductFlowPageProps {
  collateralToken: string
  debtToken: string
  product: string
}

function AjnaProductFlowPage({ collateralToken, debtToken, product }: AjnaProductFlowPageProps) {
  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <Box sx={{ width: '100%', mt: '100px' }}>
            Open {product} {collateralToken}-{debtToken} position.
          </Box>
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
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
              tokens[product][collateralToken].map((debtToken) => ({
                locale,
                params: { pair: `${collateralToken}-${debtToken}`, product },
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
      debtToken: pair[1],
      ...params,
    },
  }
}
