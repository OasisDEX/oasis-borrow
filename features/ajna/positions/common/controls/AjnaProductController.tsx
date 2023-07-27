import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { isAddress } from 'ethers/lib/utils'
import { steps } from 'features/ajna/common/consts'
import { AjnaWrapper } from 'features/ajna/common/layout'
import { AjnaFlow, AjnaProduct } from 'features/ajna/common/types'
import { AjnaBorrowPositionController } from 'features/ajna/positions/borrow/controls/AjnaBorrowPositionController'
import { useAjnaBorrowFormReducto } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { AjnaGeneralContextProvider } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { AjnaProductContextProvider } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
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
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { getPositionIdentity } from 'helpers/getPositionIdentity'
import { useObservable } from 'helpers/observableHook'
import { useAccount } from 'helpers/useAccount'
import { zero } from 'helpers/zero'
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
    balancesFromAddressInfoArray$,
    dpmPositionData$,
    gasPrice$,
    identifiedTokens$,
    tokenPriceUSD$,
    userSettings$,
  } = useAppContext()
  const { walletAddress } = useAccount()
  const isOracless =
    collateralToken && quoteToken && isAddress(collateralToken) && isAddress(quoteToken)

  const [userSettingsData, userSettingsError] = useObservable(userSettings$)

  const [gasPriceData, gasPriceError] = useObservable(gasPrice$)

  const [identifiedTokensData] = useObservable(
    useMemo(
      () => (isOracless ? identifiedTokens$([collateralToken, quoteToken]) : EMPTY),
      [isOracless, collateralToken, quoteToken],
    ),
  )
  const [dpmPositionData, dpmPositionError] = useObservable(
    useMemo(
      () =>
        id
          ? dpmPositionData$(getPositionIdentity(id))
          : !isOracless && product && collateralToken && quoteToken
          ? getStaticDpmPositionData$({ collateralToken, product, protocol: 'Ajna', quoteToken })
          : isOracless && identifiedTokensData && product
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              product,
              protocol: 'Ajna',
              quoteToken: identifiedTokensData[quoteToken].symbol,
            })
          : EMPTY,
      [collateralToken, id, identifiedTokensData, product, quoteToken],
    ),
  )
  const [ethBalanceData, ethBalanceError] = useObservable(
    useMemo(
      () =>
        dpmPositionData
          ? balancesInfoArray$(['ETH'], walletAddress || dpmPositionData.user)
          : EMPTY,
      [dpmPositionData, walletAddress],
    ),
  )
  const [balancesInfoArrayData, balancesInfoArrayError] = useObservable(
    useMemo(
      () =>
        !isOracless && dpmPositionData
          ? balancesInfoArray$(
              [dpmPositionData.collateralToken, dpmPositionData.quoteToken, 'ETH'],
              walletAddress || dpmPositionData.user,
            )
          : isOracless && dpmPositionData && identifiedTokensData
          ? balancesFromAddressInfoArray$(
              [
                {
                  address: collateralToken,
                  precision: identifiedTokensData[collateralToken].precision,
                },
                {
                  address: quoteToken,
                  precision: identifiedTokensData[quoteToken].precision,
                },
              ],
              walletAddress || dpmPositionData.user,
            )
          : EMPTY,
      [
        collateralToken,
        dpmPositionData,
        identifiedTokensData,
        isOracless,
        quoteToken,
        walletAddress,
      ],
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
        !isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken],
              tokenPriceUSDData[dpmPositionData.quoteToken],
              dpmPositionData,
              undefined,
              undefined,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(
              tokenPriceUSDData[dpmPositionData.collateralToken] || zero,
              tokenPriceUSDData[dpmPositionData.quoteToken] || zero,
              dpmPositionData,
              collateralToken,
              quoteToken,
            )
          : EMPTY,
      [dpmPositionData, isOracless, tokenPriceUSDData],
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

  const tokensPrecision = useMemo(() => {
    return !isOracless && dpmPositionData
      ? {
          collateralPrecision: getToken(dpmPositionData.collateralToken).precision,
          quotePrecision: getToken(dpmPositionData.quoteToken).precision,
        }
      : isOracless && identifiedTokensData
      ? {
          collateralPrecision: identifiedTokensData[collateralToken].precision,
          quotePrecision: identifiedTokensData[quoteToken].precision,
        }
      : undefined
  }, [collateralToken, dpmPositionData, identifiedTokensData, isOracless, quoteToken])

  if ((dpmPositionData || ajnaPositionData) === null) void push('/not-found')

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <AjnaWrapper>
            <WithErrorHandler
              error={[
                ajnaPositionError,
                ethBalanceError,
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
                  ethBalanceData,
                  balancesInfoArrayData,
                  dpmPositionData,
                  tokenPriceUSDData,
                  gasPriceData,
                  ajnaPositionAuctionData,
                  ajnaHistoryData,
                  ajnaPositionCumulatives,
                  userSettingsData,
                  tokensPrecision,
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
                  [ethBalance],
                  [collateralBalance, quoteBalance],
                  dpmPosition,
                  tokenPriceUSD,
                  gasPrice,
                  ajnaPositionAuction,
                  ajnaHistory,
                  ajnaPositionCumulatives,
                  { slippage },
                  { collateralPrecision, quotePrecision },
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
                        collateralPrecision={collateralPrecision}
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
                        quotePrecision={quotePrecision}
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
