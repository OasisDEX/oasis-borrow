import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { getNetworkContracts } from 'blockchain/contracts'
import { NetworkIds } from 'blockchain/networks'
import { getToken } from 'blockchain/tokensMetadata'
import { useAppContext } from 'components/AppContextProvider'
import { WithConnection } from 'components/connectWallet'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
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
import { one } from 'helpers/zero'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useMemo } from 'react'
import { EMPTY } from 'rxjs'

interface AjnaProductControllerProps {
  collateralToken?: string
  id?: string
  flow: AjnaFlow
  product?: AjnaProduct
  quoteToken?: string
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
    context$,
    ajnaPosition$,
    balancesFromAddressInfoArray$,
    balancesInfoArray$,
    dpmPositionDataV2$,
    gasPrice$,
    identifiedTokens$,
    readPositionCreatedEvents$,
    tokenPriceUSD$,
    userSettings$,
  } = useAppContext()
  const { walletAddress } = useAccount()
  const isOracless =
    collateralToken && quoteToken && isAddress(collateralToken) && isAddress(quoteToken)

  const [context] = useObservable(context$)
  const tokensAddresses = useMemo(
    () => getNetworkContracts(NetworkIds.MAINNET, context?.chainId).tokens,
    [context],
  )

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
        !isOracless && id
          ? dpmPositionDataV2$(getPositionIdentity(id), collateralToken, quoteToken, product)
          : isOracless && identifiedTokensData && id
          ? dpmPositionDataV2$(
              getPositionIdentity(id),
              identifiedTokensData[collateralToken].symbol,
              identifiedTokensData[quoteToken].symbol,
              product,
            )
          : !isOracless && product && collateralToken && quoteToken
          ? getStaticDpmPositionData$({
              collateralToken,
              collateralTokenAddress: tokensAddresses[collateralToken].address,
              product,
              protocol: 'Ajna',
              quoteToken,
              quoteTokenAddress: tokensAddresses[quoteToken].address,
            })
          : isOracless && identifiedTokensData && product
          ? getStaticDpmPositionData$({
              collateralToken: identifiedTokensData[collateralToken].symbol,
              collateralTokenAddress: collateralToken,
              product,
              protocol: 'Ajna',
              quoteToken: identifiedTokensData[quoteToken].symbol,
              quoteTokenAddress: quoteToken,
            })
          : EMPTY,
      [isOracless, id, collateralToken, quoteToken, product, identifiedTokensData, tokensAddresses],
    ),
  )

  const [positionCreatedEvents] = useObservable(
    useMemo(
      () => (dpmPositionData ? readPositionCreatedEvents$(dpmPositionData.user) : EMPTY),
      [dpmPositionData],
    ),
  )

  const isProxyWithManyPositions = positionCreatedEvents
    ? positionCreatedEvents.filter(
        (item) => item.proxyAddress.toLowerCase() === dpmPositionData?.proxy.toLowerCase(),
      ).length > 1
    : false

  useEffect(() => {
    if (
      id &&
      isProxyWithManyPositions &&
      dpmPositionData &&
      !collateralToken &&
      !quoteToken &&
      !product
    ) {
      const {
        product: dpmProduct,
        collateralToken: dpmCollateralToken,
        quoteToken: dpmQuoteToken,
      } = dpmPositionData

      void push(`/ethereum/ajna/${dpmProduct}/${dpmCollateralToken}-${dpmQuoteToken}/${id}`)
    }
  }, [isProxyWithManyPositions, dpmPositionData])

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
        isOracless,
        dpmPositionData,
        walletAddress,
        identifiedTokensData,
        collateralToken,
        quoteToken,
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
              dpmPositionData.collateralTokenAddress,
              dpmPositionData.quoteTokenAddress,
            )
          : isOracless && dpmPositionData && tokenPriceUSDData
          ? ajnaPosition$(one, one, dpmPositionData, collateralToken, quoteToken)
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
          collateralDigits: getToken(dpmPositionData.collateralToken).digits,
          collateralPrecision: getToken(dpmPositionData.collateralToken).precision,
          quoteDigits: getToken(dpmPositionData.quoteToken).digits,
          quotePrecision: getToken(dpmPositionData.quoteToken).precision,
        }
      : isOracless && identifiedTokensData
      ? {
          collateralDigits: DEFAULT_TOKEN_DIGITS,
          collateralPrecision: identifiedTokensData[collateralToken].precision,
          quoteDigits: DEFAULT_TOKEN_DIGITS,
          quotePrecision: identifiedTokensData[quoteToken].precision,
        }
      : undefined
  }, [isOracless, dpmPositionData, identifiedTokensData, collateralToken, quoteToken])

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
                  { collateralDigits, collateralPrecision, quoteDigits, quotePrecision },
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
                        collateralAddress={dpmPosition.collateralTokenAddress}
                        collateralBalance={collateralBalance}
                        collateralDigits={collateralDigits}
                        collateralPrecision={collateralPrecision}
                        collateralPrice={
                          isOracless ? one : tokenPriceUSD[dpmPosition.collateralToken]
                        }
                        collateralToken={dpmPosition.collateralToken}
                        {...(flow === 'manage' && { dpmProxy: dpmPosition.proxy })}
                        ethBalance={ethBalance}
                        ethPrice={tokenPriceUSD.ETH}
                        flow={flow}
                        id={id}
                        isOracless={!!isOracless}
                        owner={dpmPosition.user}
                        product={dpmPosition.product as AjnaProduct}
                        quoteAddress={dpmPosition.quoteTokenAddress}
                        quoteBalance={quoteBalance}
                        quoteDigits={quoteDigits}
                        quotePrecision={quotePrecision}
                        quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                        quoteToken={dpmPosition.quoteToken}
                        steps={steps[dpmPosition.product as AjnaProduct][flow]}
                        gasPrice={gasPrice}
                        slippage={slippage}
                        isProxyWithManyPositions={isProxyWithManyPositions}
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
