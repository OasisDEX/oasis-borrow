import { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
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
import { useAjnaData } from 'features/ajna/positions/common/hooks/useAjnaData'
import {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAuction'
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
import { one } from 'helpers/zero'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

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
    data: {
      ajnaHistoryData,
      ajnaPositionAuctionData,
      ajnaPositionCumulativesData,
      ajnaPositionData,
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      userSettingsData,
    },
    errors,
    isOracless,
    isProxyWithManyPositions,
    tokensPrecision,
  } = useAjnaData({
    collateralToken,
    id,
    product,
    quoteToken,
  })

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
  }, [isProxyWithManyPositions, dpmPositionData, id, collateralToken, quoteToken, product, push])

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
            <WithErrorHandler error={errors}>
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
                  ajnaPositionCumulativesData,
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
                ]) => (
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
                )}
              </WithLoadingIndicator>
            </WithErrorHandler>
          </AjnaWrapper>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
