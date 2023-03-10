import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/oasis-actions-poc'
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
import { getStaticDpmPositionData$ } from 'features/ajna/positions/common/observables/getDpmPositionData'
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
  const {
    ajnaPosition$,
    ajnaDpmPositionData$,
    balancesInfoArray$,
    tokenPriceUSD$,
  } = useAppContext()
  const { walletAddress } = useAccount()

  const [ajnaDpmPositionData, ajnaDpmPositionError] = useObservable(
    useMemo(
      () =>
        id
          ? ajnaDpmPositionData$(getPositionIdentity(id))
          : collateralToken && product && quoteToken
          ? getStaticDpmPositionData$({ collateralToken, product, protocol: 'Ajna', quoteToken })
          : EMPTY,
      [collateralToken, id, product, quoteToken],
    ),
  )
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        ajnaDpmPositionData && walletAddress
          ? balancesInfoArray$(
              [ajnaDpmPositionData.collateralToken, ajnaDpmPositionData.quoteToken, 'ETH'],
              walletAddress,
            )
          : EMPTY,
      [ajnaDpmPositionData, walletAddress],
    ),
  )
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        ajnaDpmPositionData
          ? tokenPriceUSD$([
              ajnaDpmPositionData.collateralToken,
              ajnaDpmPositionData.quoteToken,
              'ETH',
            ])
          : EMPTY,
      [ajnaDpmPositionData],
    ),
  )
  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(() => (ajnaDpmPositionData ? ajnaPosition$(ajnaDpmPositionData) : EMPTY), [
      ajnaDpmPositionData,
    ]),
  )

  if ((ajnaDpmPositionData || ajnaPositionData) === null) void push('/not-found')

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler
              error={[
                ajnaDpmPositionError,
                ajnaPositionError,
                balancesInfoArrayError,
                tokenPriceUSDError,
              ]}
            >
              <WithLoadingIndicator
                value={[
                  ajnaDpmPositionData,
                  ajnaPositionData,
                  balancesInfoArrayData,
                  tokenPriceUSDData,
                ]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaHeadlineProps({
                      collateralToken: ajnaDpmPositionData?.collateralToken,
                      flow,
                      product: ajnaDpmPositionData?.product,
                      quoteToken: ajnaDpmPositionData?.quoteToken,
                      id,
                    })}
                  />
                }
              >
                {([
                  ajnaDpmPosition,
                  ajnaPosition,
                  [collateralBalance, quoteBalance, ethBalance],
                  tokenPriceUSD,
                ]) =>
                  ajnaPosition ? (
                    <>
                      <PageSEOTags
                        title="seo.title-product-w-tokens"
                        titleParams={{
                          product: t(`seo.ajnaProductPage.title`, {
                            product: startCase(ajnaDpmPosition.product),
                          }),
                          protocol: 'Ajna',
                          token1: ajnaDpmPosition.collateralToken,
                          token2: ajnaDpmPosition.quoteToken,
                        }}
                        description="seo.ajna.description"
                        url={document.location.pathname}
                      />
                      <AjnaGeneralContextProvider
                        collateralBalance={collateralBalance}
                        collateralPrice={tokenPriceUSD[ajnaDpmPosition.collateralToken]}
                        collateralToken={ajnaDpmPosition.collateralToken}
                        {...(flow === 'manage' && { dpmProxy: ajnaDpmPosition.proxy })}
                        ethBalance={ethBalance}
                        ethPrice={tokenPriceUSD.ETH}
                        flow={flow}
                        id={id}
                        owner={ajnaDpmPosition.user}
                        product={ajnaDpmPosition.product}
                        quoteBalance={quoteBalance}
                        quotePrice={tokenPriceUSD[ajnaDpmPosition.quoteToken]}
                        quoteToken={ajnaDpmPosition.quoteToken}
                        steps={steps[ajnaDpmPosition.product][flow]}
                      >
                        {ajnaDpmPosition.product === 'borrow' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                            }}
                            formReducto={useAjnaBorrowFormReducto}
                            position={ajnaPosition as AjnaPosition}
                            product={ajnaDpmPosition.product}
                          >
                            <AjnaBorrowPositionController />
                          </AjnaProductContextProvider>
                        )}
                        {ajnaDpmPosition.product === 'earn' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-earn' : 'deposit-earn',
                              price: ajnaPosition.pool.highestThresholdPrice.decimalPlaces(2),
                            }}
                            formReducto={useAjnaEarnFormReducto}
                            position={ajnaPosition as AjnaEarnPosition}
                            product={ajnaDpmPosition.product}
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
