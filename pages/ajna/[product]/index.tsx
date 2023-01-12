import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { GenericSelect } from 'components/GenericSelect'
import { AppLink } from 'components/Links'
import { products, tokens } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useState } from 'react'
import { Box, Button, Flex, Heading } from 'theme-ui'

function AjnaOpenBorrow({ product }: { product: string }) {
  const pairs = tokens[product as keyof typeof tokens]
  const [collateralToken, setCollateralToken] = useState<string>()
  const [debtToken, setDebtToken] = useState<string>()
  const isDisabled = !collateralToken || !debtToken

  console.log('isDisabled')
  console.log(isDisabled)

  return (
    <WithConnection>
      <WithTermsOfService>
        <AjnaWrapper>
          <Box sx={{ width: '100%', mt: '100px' }}>
            <Heading>Ajna temporary {product} selector</Heading>
            <Flex sx={{ columnGap: 3, mt: 3 }}>
              <GenericSelect
                placeholder="Select collateral token"
                options={pairs.collateral.map((item) => ({
                  label: item,
                  value: item.toLowerCase(),
                }))}
                wrapperSx={{ width: '100%', maxWidth: '250px' }}
                onChange={(currentValue) => setCollateralToken(currentValue.value)}
              />
              <GenericSelect
                placeholder="Select debt token"
                options={pairs.debt.map((item) => ({
                  label: item,
                  value: item.toLowerCase(),
                }))}
                wrapperSx={{ width: '100%', maxWidth: '250px' }}
                onChange={(currentValue) => setDebtToken(currentValue.value)}
              />
              <AppLink
                href={`/ajna/${product}/${collateralToken}-${debtToken}`}
                sx={{ pointerEvents: isDisabled ? 'none' : 'auto' }}
              >
                <Button variant="primary" sx={{ px: 4 }} disabled={isDisabled}>
                  Select
                </Button>
              </AppLink>
            </Flex>
          </Box>
        </AjnaWrapper>
      </WithTermsOfService>
    </WithConnection>
  )
}

AjnaOpenBorrow.layout = AjnaLayout
AjnaOpenBorrow.seoTags = ajnaPageSeoTags

export default AjnaOpenBorrow

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
