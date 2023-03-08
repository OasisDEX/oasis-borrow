import { AjnaEarnPosition, AjnaPosition } from '@oasis-actions-poc'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet/ConnectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { steps } from 'features/ajna/common/consts'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaBorrowPositionController } from 'features/ajna/positions/borrow/controls/AjnaBorrowPositionController'
import { useAjnaBorrowFormReducto } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { AjnaGeneralContextProvider } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaProductContextProvider } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import { AjnaEarnPositionController } from 'features/ajna/positions/earn/controls/AjnaEarnPositionController'
import { useAjnaEarnFormReducto } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { startCase } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface AjnaProductControllerOpenFlow {
  collateralToken: string
  product: AjnaProduct
  quoteToken: string
  id?: never
}

interface AjnaProductControllerManageFlow {
  id: string
  collateralToken?: never
  product?: never
  quoteToken?: never
}

type AjnaProductControllerProps = (
  | AjnaProductControllerOpenFlow
  | AjnaProductControllerManageFlow
) & {
  flow: AjnaFlow
}

export function AjnaProductController({
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
}: AjnaProductControllerProps) {
  const { t } = useTranslation()
  const { push } = useRouter()
  const { ajnaPosition$, balancesInfoArray$, tokenPriceUSD$ } = useAppContext()
  const { walletAddress } = useAccount()

  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        ajnaPosition$(
          id
            ? { positionId: getPositionIdentity(id) }
            : {
                collateralToken: collateralToken as string,
                product: product as string,
                quoteToken: quoteToken as string,
              },
        ),
      [id, collateralToken, product, quoteToken],
    ),
  )
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        ajnaPositionData?.meta.collateralToken && ajnaPositionData?.meta.quoteToken
          ? balancesInfoArray$(
              [ajnaPositionData.meta.collateralToken, ajnaPositionData.meta.quoteToken, 'ETH'],
              walletAddress || '',
            )
          : EMPTY,
      [ajnaPositionData],
    ),
  )
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        ajnaPositionData?.meta.collateralToken && ajnaPositionData?.meta.quoteToken
          ? tokenPriceUSD$([
              ajnaPositionData.meta.collateralToken,
              ajnaPositionData.meta.quoteToken,
              'ETH',
            ])
          : EMPTY,
      [ajnaPositionData],
    ),
  )

  if (ajnaPositionData === null) void push('/not-found')

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler
              error={[ajnaPositionError, balancesInfoArrayError, tokenPriceUSDError]}
            >
              <WithLoadingIndicator
                value={[ajnaPositionData, balancesInfoArrayData, tokenPriceUSDData]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaHeadlineProps({
                      collateralToken: ajnaPositionData?.meta.collateralToken,
                      flow,
                      product: ajnaPositionData?.meta.product,
                      quoteToken: ajnaPositionData?.meta.quoteToken,
                      id,
                    })}
                  />
                }
              >
                {([ajnaPosition, [collateralBalance, quoteBalance, ethBalance], tokenPriceUSD]) =>
                  ajnaPosition ? (
                    <>
                      <PageSEOTags
                        title="seo.title-product-w-tokens"
                        titleParams={{
                          product: t(`seo.ajnaProductPage.title`, {
                            product: startCase(ajnaPosition.meta.product),
                          }),
                          protocol: 'Ajna',
                          token1: ajnaPosition.meta.collateralToken,
                          token2: ajnaPosition.meta.quoteToken,
                        }}
                        description="seo.ajna.description"
                        url={document.location.pathname}
                      />
                      <AjnaGeneralContextProvider
                        collateralBalance={collateralBalance}
                        collateralPrice={tokenPriceUSD[ajnaPosition.meta.collateralToken]}
                        collateralToken={ajnaPosition.meta.collateralToken}
                        {...(flow === 'manage' && { dpmProxy: ajnaPosition.meta.proxy })}
                        ethBalance={ethBalance}
                        ethPrice={tokenPriceUSD.ETH}
                        flow={flow}
                        id={id}
                        owner={ajnaPosition.meta.user}
                        product={ajnaPosition.meta.product}
                        quoteBalance={quoteBalance}
                        quotePrice={tokenPriceUSD[ajnaPosition.meta.quoteToken]}
                        quoteToken={ajnaPosition.meta.quoteToken}
                        steps={steps[ajnaPosition.meta.product][flow]}
                      >
                        {ajnaPosition.meta.product === 'borrow' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                            }}
                            formReducto={useAjnaBorrowFormReducto}
                            position={ajnaPosition.position as AjnaPosition}
                            product={ajnaPosition.meta.product}
                          >
                            <AjnaBorrowPositionController />
                          </AjnaProductContextProvider>
                        )}
                        {ajnaPosition.meta.product === 'earn' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-earn' : 'deposit-earn',
                              price: (ajnaPosition.position as AjnaEarnPosition).pool.highestThresholdPrice.decimalPlaces(
                                2,
                              ),
                            }}
                            formReducto={useAjnaEarnFormReducto}
                            position={ajnaPosition.position as AjnaEarnPosition}
                            product={ajnaPosition.meta.product}
                          >
                            <AjnaEarnPositionController />
                          </AjnaProductContextProvider>
                        )}
                      </AjnaGeneralContextProvider>
                    </>
                  ) : (
                    <></>
                  )
                }
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AjnaWrapper>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
