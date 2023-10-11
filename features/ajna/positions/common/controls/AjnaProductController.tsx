import type { AjnaEarnPosition, AjnaPosition } from '@oasisdex/dma-library'
import { NetworkHexIds } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { steps } from 'features/ajna/common/consts'
import type { ProtocolFlow, ProtocolProduct } from 'features/ajna/common/types'
import { AjnaBorrowPositionController } from 'features/ajna/positions/borrow/controls/AjnaBorrowPositionController'
import { useAjnaBorrowFormReducto } from 'features/ajna/positions/borrow/state/ajnaBorrowFormReducto'
import { AjnaProductContextProvider } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { ProtocolGeneralContextProvider } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import { useAjnaData } from 'features/ajna/positions/common/hooks/useAjnaData'
import { useAjnaRedirect } from 'features/ajna/positions/common/hooks/useAjnaRedirect'
import type {
  AjnaBorrowishPositionAuction,
  AjnaEarnPositionAuction,
} from 'features/ajna/positions/common/observables/getAjnaPositionAggregatedData'
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
import { one } from 'helpers/zero'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React from 'react'

interface AjnaProductControllerProps {
  collateralToken?: string
  id?: string
  flow: ProtocolFlow
  product?: ProtocolProduct
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
      ajnaPositionAggregatedData,
      ajnaPositionData,
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      userSettingsData,
      tokensIconsData,
    },
    errors,
    isOracless,
    tokensPrecision,
  } = useAjnaData({
    collateralToken,
    id,
    product,
    quoteToken,
  })
  const redirect = useAjnaRedirect({
    ajnaPositionData,
    collateralToken,
    dpmPositionData,
    id,
    product,
    quoteToken,
  })

  if (redirect) void push(redirect)

  return (
    <WithConnection pageChainId={NetworkHexIds.MAINNET} includeTestNet={true}>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <WithErrorHandler error={errors}>
            <WithLoadingIndicator
              value={[
                ajnaPositionData,
                ethBalanceData,
                balancesInfoArrayData,
                dpmPositionData,
                tokenPriceUSDData,
                gasPriceData,
                ajnaPositionAggregatedData,
                userSettingsData,
                tokensPrecision,
                tokensIconsData,
              ]}
              customLoader={
                <PositionLoadingState
                  {...getAjnaHeadlineProps({
                    collateralToken: dpmPositionData?.collateralToken,
                    flow,
                    product: dpmPositionData?.product as ProtocolProduct,
                    quoteToken: dpmPositionData?.quoteToken,
                    collateralIcon: tokensIconsData?.collateralToken,
                    quoteIcon: tokensIconsData?.quoteToken,
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
                { auction, history },
                { slippage },
                { collateralDigits, collateralPrecision, quoteDigits, quotePrecision },
                tokensIconsData,
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
                  <ProtocolGeneralContextProvider
                    collateralAddress={dpmPosition.collateralTokenAddress}
                    collateralBalance={collateralBalance}
                    collateralDigits={collateralDigits}
                    collateralPrecision={collateralPrecision}
                    collateralPrice={isOracless ? one : tokenPriceUSD[dpmPosition.collateralToken]}
                    collateralToken={dpmPosition.collateralToken}
                    collateralIcon={tokensIconsData.collateralToken}
                    {...(flow === 'manage' && { dpmProxy: dpmPosition.proxy })}
                    ethBalance={ethBalance}
                    ethPrice={tokenPriceUSD.ETH}
                    flow={flow}
                    id={id}
                    isOracless={!!isOracless}
                    owner={dpmPosition.user}
                    product={dpmPosition.product as ProtocolProduct}
                    quoteAddress={dpmPosition.quoteTokenAddress}
                    quoteBalance={quoteBalance}
                    quoteDigits={quoteDigits}
                    quotePrecision={quotePrecision}
                    quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                    quoteToken={dpmPosition.quoteToken}
                    quoteIcon={tokensIconsData.quoteToken}
                    steps={steps[dpmPosition.product as ProtocolProduct][flow]}
                    gasPrice={gasPrice}
                    slippage={slippage}
                    isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                  >
                    {dpmPosition.product === 'borrow' && (
                      <AjnaProductContextProvider
                        formDefaults={{
                          action: flow === 'open' ? 'open-borrow' : 'deposit-borrow',
                        }}
                        formReducto={useAjnaBorrowFormReducto}
                        position={ajnaPosition as AjnaPosition}
                        product={dpmPosition.product}
                        positionAuction={auction as AjnaBorrowishPositionAuction}
                        positionHistory={history}
                      >
                        <AjnaBorrowPositionController />
                      </AjnaProductContextProvider>
                    )}
                    {dpmPosition.product === 'earn' && (
                      <AjnaProductContextProvider
                        formDefaults={{
                          action: getAjnaEarnDefaultAction(flow, ajnaPosition as AjnaEarnPosition),
                          uiDropdown: getAjnaEarnDefaultUiDropdown(
                            ajnaPosition as AjnaEarnPosition,
                          ),
                          price: getEarnDefaultPrice(ajnaPosition as AjnaEarnPosition),
                        }}
                        formReducto={useAjnaEarnFormReducto}
                        position={ajnaPosition as AjnaEarnPosition}
                        product={dpmPosition.product}
                        positionAuction={auction as AjnaEarnPositionAuction}
                        positionHistory={history}
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
                        positionAuction={auction as AjnaBorrowishPositionAuction}
                        positionHistory={history}
                      >
                        <AjnaMultiplyPositionController />
                      </AjnaProductContextProvider>
                    )}
                  </ProtocolGeneralContextProvider>
                </>
              )}
            </WithLoadingIndicator>
          </WithErrorHandler>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
