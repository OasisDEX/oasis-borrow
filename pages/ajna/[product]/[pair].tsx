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
            [
              tokens[product as keyof typeof tokens].collateral,
              tokens[product as keyof typeof tokens].debt,
            ]
              .reduce<string[][]>(
                (results, ids) => results.flatMap((result) => ids.map((id) => [result, id].flat())),
                [[]],
              )
              .map((pair) => ({ params: { pair: pair.join('-').toLowerCase(), product }, locale })),
          ),
        )
        .flat(2) ?? [],
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale, params }) => {
  const pair = (params?.pair as string).split('-')

  return {
    // ...(!products.includes(params?.product as string) && { notFound: true }),
    props: {
      ...(await serverSideTranslations(locale || 'en', ['common'])),
      collateralToken: pair[0],
      debtToken: pair[1],
      ...params,
    },
  }
}
