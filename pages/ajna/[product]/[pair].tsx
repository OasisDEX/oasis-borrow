import { useAppContext } from 'components/AppContextProvider'
import { WithWalletConnection } from 'components/connectWallet/ConnectWallet'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { getAjnaBorrowHeadlineProps } from 'features/ajna/borrow/helpers'
import { AjnaBorrowView } from 'features/ajna/borrow/views/AjnaBorrowView'
import { products, tokens } from 'features/ajna/common/consts'
import { AjnaLayout, ajnaPageSeoTags, AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaProduct } from 'features/ajna/common/types'
import { AjnaBorrowContextProvider } from 'features/ajna/contexts/AjnaProductContext'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { GetStaticPaths, GetStaticProps } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import React, { useMemo } from 'react'

interface AjnaProductFlowPageProps {
  collateralToken: string
  quoteToken: string
  product: AjnaProduct
}

function AjnaProductFlowPage({ collateralToken, quoteToken, product }: AjnaProductFlowPageProps) {
  const { balanceInfo$, tokenPriceUSD$ } = useAppContext()
  const { walletAddress } = useAccount()
  const _balanceInfo$ = useMemo(() => balanceInfo$(collateralToken, walletAddress), [
    collateralToken,
    walletAddress,
  ])
  const _tokenPriceUSD$ = useMemo(() => tokenPriceUSD$([collateralToken, quoteToken]), [
    collateralToken,
    quoteToken,
  ])
  const [balanceInfoData, balanceInfoError] = useObservable(_balanceInfo$)
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(_tokenPriceUSD$)

  return (
    <WithWalletConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler error={[balanceInfoError, tokenPriceUSDError]}>
              <WithLoadingIndicator
                value={[balanceInfoData, tokenPriceUSDData]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaBorrowHeadlineProps(collateralToken, quoteToken)}
                  />
                }
              >
                {([{ collateralBalance }, tokenPriceUSD]) => (
                  <AjnaBorrowContextProvider
                    collateralBalance={collateralBalance}
                    collateralToken={collateralToken}
                    collateralPrice={tokenPriceUSD[collateralToken]}
                    product={product}
                    quoteToken={quoteToken}
                    quotePrice={tokenPriceUSD[quoteToken]}
                  >
                    {product === 'borrow' && <AjnaBorrowView />}
                  </AjnaBorrowContextProvider>
                )}
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AjnaWrapper>
        </WithWalletAssociatedRisk>
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
