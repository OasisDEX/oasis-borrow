import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
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
import { isPoolSupportingMultiply } from 'features/ajna/positions/common/helpers/isPoolSupportingMultiply'
import { getAjnaHistory$ } from 'features/ajna/positions/common/observables/getAjnaHistory'
import {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
  getAjnaPositionAuction$,
} from 'features/ajna/positions/common/observables/getAjnaPositionAuction'
import { getStaticDpmPositionData$ } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { getPositionCumulatives$ } from 'features/ajna/positions/common/observables/getPositionCumulatives'
import { AjnaEarnPositionController } from 'features/ajna/positions/earn/controls/AjnaEarnPositionController'
import { getAjnaEarnDefaultAction } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultAction'
import { getAjnaEarnDefaultUiDropdown } from 'features/ajna/positions/earn/helpers/getAjnaEarnDefaultUiDropdown'
import { getEarnDefaultPrice } from 'features/ajna/positions/earn/helpers/getEarnDefaultPrice'
import { useAjnaEarnFormReducto } from 'features/ajna/positions/earn/state/ajnaEarnFormReducto'
import { AjnaMultiplyPositionController } from 'features/ajna/positions/multiply/controls/AjnaMultiplyPositionController'
import { useAjnaMultiplyFormReducto } from 'features/ajna/positions/multiply/state/ajnaMultiplyFormReducto'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { upperFirst } from 'lodash'
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
    balancesInfoArray$,
    dpmPositionData$,
    tokenPriceUSD$,
    gasPrice$,
    userSettings$,
  } = useAppContext()
  const { walletAddress } = useAccount()

  const [userSettingsData, userSettingsError] = useObservable(userSettings$)

  const [gasPriceData, gasPriceError] = useObservable(gasPrice$)
  const [dpmPositionData, dpmPositionError] = useObservable(
    useMemo(
      () =>
        id
          ? dpmPositionData$(getPositionIdentity(id))
          : collateralToken && product && quoteToken
          ? getStaticDpmPositionData$({ collateralToken, product, protocol: 'Ajna', quoteToken })
          : EMPTY,
      [collateralToken, id, product, quoteToken],
    ),
  )
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? balancesInfoArray$(
              [dpmPositionData.collateralToken, dpmPositionData.quoteToken, 'ETH'],
              walletAddress || dpmPositionData.user,
            )
          : EMPTY,
      [dpmPositionData, walletAddress],
    ),
  )
  const [tokenPriceUSDData, tokenPriceUSDError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? tokenPriceUSD$([dpmPositionData.collateralToken, dpmPositionData.quoteToken, 'ETH'])
          : EMPTY,
      [dpmPositionData],
    ),
  )
  const [ajnaPositionData, ajnaPositionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
            )
          : EMPTY,
      [dpmPositionData, tokenPriceUSDData],
    ),
  )

  const [ajnaPositionAuctionData, ajnaPositionAuctionError] = useObservable(
    useMemo(
      () =>
        dpmPositionData && ajnaPositionData
          ? getAjnaPositionAuction$({ dpmPositionData, ajnaPositionData })
          : EMPTY,
      [dpmPositionData, ajnaPositionData],
    ),
  )

  const [ajnaHistoryData, ajnaHistoryError] = useObservable(
    useMemo(
      () => (dpmPositionData ? getAjnaHistory$({ dpmPositionData }) : EMPTY),
      [dpmPositionData, ajnaPositionData],
    ),
  )

  const [ajnaPositionCumulatives, ajnaPositionCumulativesError] = useObservable(
    useMemo(
      () => (dpmPositionData ? getPositionCumulatives$({ dpmPositionData }) : EMPTY),
      [dpmPositionData, ajnaPositionData],
    ),
  )

  if ((dpmPositionData || ajnaPositionData) === null) void push(INTERNAL_LINKS.notFound)
  if (
    !id &&
    collateralToken &&
    quoteToken &&
    product === 'multiply' &&
    !isPoolSupportingMultiply({ collateralToken, quoteToken })
  )
    void push(INTERNAL_LINKS.ajnaMultiply)

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler
              error={[
                ajnaPositionError,
                balancesInfoArrayError,
                dpmPositionError,
                tokenPriceUSDError,
                gasPriceError,
                ajnaPositionAuctionError,
                ajnaHistoryError,
                ajnaPositionCumulativesError,
                userSettingsError,
              ]}
            >
              <WithLoadingIndicator
                value={[
                  ajnaPositionData,
                  balancesInfoArrayData,
                  dpmPositionData,
                  tokenPriceUSDData,
                  gasPriceData,
                  ajnaPositionAuctionData,
                  ajnaHistoryData,
                  ajnaPositionCumulatives,
                  userSettingsData,
                ]}
                customLoader={
                  <PositionLoadingState
                    {...getAjnaHeadlineProps({
                      collateralToken: dpmPositionData?.collateralToken,
                      flow,
                      product: dpmPositionData?.product as AjnaProduct,
                      quoteToken: dpmPositionData?.quoteToken,
                      id,
                    })}
                  />
                }
              >
                {([
                  ajnaPosition,
                  [collateralBalance, quoteBalance, ethBalance],
                  dpmPosition,
                  tokenPriceUSD,
                  gasPrice,
                  ajnaPositionAuction,
                  ajnaHistory,
                  ajnaPositionCumulatives,
                  { slippage },
                ]) =>
                  ajnaPosition ? (
                    <>
                      <PageSEOTags
                        title="seo.title-product-w-tokens"
                        titleParams={{
                          product: t(`seo.ajnaProductPage.title`, {
                            product: upperFirst(dpmPosition.product),
                          }),
                          protocol: 'Ajna',
                          token1: dpmPosition.collateralToken,
                          token2: dpmPosition.quoteToken,
                        }}
                        description="seo.ajna.description"
                        url={document.location.pathname}
                      />
                      <AjnaGeneralContextProvider
                        collateralBalance={collateralBalance}
                        collateralPrice={tokenPriceUSD[dpmPosition.collateralToken]}
                        collateralToken={dpmPosition.collateralToken}
                        {...(flow === 'manage' && { dpmProxy: dpmPosition.proxy })}
                        ethBalance={ethBalance}
                        ethPrice={tokenPriceUSD.ETH}
                        flow={flow}
                        id={id}
                        owner={dpmPosition.user}
                        product={dpmPosition.product as AjnaProduct}
                        quoteBalance={quoteBalance}
                        quotePrice={tokenPriceUSD[dpmPosition.quoteToken]}
                        quoteToken={dpmPosition.quoteToken}
                        steps={steps[dpmPosition.product as AjnaProduct][flow]}
                        gasPrice={gasPrice}
                        slippage={slippage}
                      >
                        {dpmPosition.product === 'borrow' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                            }}
                            formReducto={useAjnaBorrowFormReducto}
                            position={ajnaPosition as AjnaPosition}
                            product={dpmPosition.product}
                            positionAuction={ajnaPositionAuction as AjnaBorrowishPositionAuction}
                            positionHistory={ajnaHistory}
                            positionCumulatives={ajnaPositionCumulatives}
                          >
                            <AjnaBorrowPositionController />
                          </AjnaProductContextProvider>
                        )}
                        {dpmPosition.product === 'earn' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: getAjnaEarnDefaultAction(
                                flow,
                                ajnaPosition as AjnaEarnPosition,
                              ),
                              uiDropdown: getAjnaEarnDefaultUiDropdown(
                                ajnaPosition as AjnaEarnPosition,
                              ),
                              price: getEarnDefaultPrice(ajnaPosition as AjnaEarnPosition),
                            }}
                            formReducto={useAjnaEarnFormReducto}
                            position={ajnaPosition as AjnaEarnPosition}
                            product={dpmPosition.product}
                            positionAuction={ajnaPositionAuction as AjnaEarnPositionAuction}
                            positionHistory={ajnaHistory}
                            positionCumulatives={ajnaPositionCumulatives}
                          >
                            <AjnaEarnPositionController />
                          </AjnaProductContextProvider>
                        )}
                        {dpmPosition.product === 'multiply' && (
                          <AjnaProductContextProvider
                            formDefaults={{
                              action: flow === 'open' ? 'open-multiply' : 'adjust',
                            }}
                            formReducto={useAjnaMultiplyFormReducto}
                            position={ajnaPosition as AjnaPosition}
                            product={dpmPosition.product}
                            positionAuction={ajnaPositionAuction as AjnaBorrowishPositionAuction}
                            positionHistory={ajnaHistory}
                            positionCumulatives={ajnaPositionCumulatives}
                          >
                            <AjnaMultiplyPositionController />
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
