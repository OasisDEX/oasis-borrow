import { NetworkHexIds } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { steps } from 'features/ajna/common/consts'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { OmniGeneralContextProvider } from 'features/omni-kit/contexts/OmniGeneralContext'
import type { ProductDataProps } from 'features/omni-kit/hooks/ajna/useAjnaOmniData'
import { useOmniProtocolData } from 'features/omni-kit/hooks/useOmniProtocolData'
import type { OmniFlow, OmniProduct } from 'features/omni-kit/types/common.types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniProductsControllerProps<A, H, P> {
  flow: OmniFlow
  dpmPosition: DpmPositionData
  aggregatedData: { auction: A; history: H }
  positionData: P
}

interface OmniProductControllerProps<A, H, P> {
  protocol: LendingProtocol
  collateralToken?: string
  id?: string
  flow: OmniFlow
  product?: OmniProduct
  quoteToken?: string
  controller: (params: OmniProductsControllerProps<A, H, P>) => React.ReactNode
  protocolHook: (params: ProductDataProps) => {
    data: { aggregatedData: { auction: A; history: H } | undefined; positionData: P | undefined }
    errors: string[]
    isOracless: boolean
    redirect: string | undefined
  }
  isOracless?: boolean
}

export const OmniProductController = <A, H, P>({
  protocol,
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  controller,
  protocolHook,
  isOracless,
}: OmniProductControllerProps<A, H, P>) => {
  const { t } = useTranslation()

  const {
    data: {
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      userSettingsData,
      tokensIconsData,
    },
    errors,
    tokensPrecision,
  } = useOmniProtocolData({
    collateralToken,
    id,
    product,
    quoteToken,
    protocol,
    isOracless,
  })

  const {
    data: { aggregatedData, positionData },
    errors: protocolDataErrors,
  } = protocolHook({
    collateralToken,
    id,
    product,
    quoteToken,
    dpmPositionData,
    tokenPriceUSDData,
  })

  return (
    <WithConnection pageChainId={NetworkHexIds.MAINNET} includeTestNet={true}>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <WithErrorHandler error={[...errors, ...protocolDataErrors]}>
            <WithLoadingIndicator
              value={[
                ethBalanceData,
                balancesInfoArrayData,
                dpmPositionData,
                tokenPriceUSDData,
                gasPriceData,
                userSettingsData,
                tokensPrecision,
                tokensIconsData,
                aggregatedData,
                positionData,
              ]}
              customLoader={
                <PositionLoadingState
                  // TODO remove ajna dependency
                  {...getAjnaHeadlineProps({
                    collateralToken: dpmPositionData?.collateralToken,
                    flow,
                    product: dpmPositionData?.product as OmniProduct,
                    quoteToken: dpmPositionData?.quoteToken,
                    collateralIcon: tokensIconsData?.collateralToken,
                    quoteIcon: tokensIconsData?.quoteToken,
                    id,
                  })}
                />
              }
            >
              {([
                [ethBalance],
                [collateralBalance, quoteBalance],
                dpmPosition,
                tokenPriceUSD,
                gasPrice,
                { slippage },
                { collateralDigits, collateralPrecision, quoteDigits, quotePrecision },
                tokensIcons,
                _aggregatedData,
                _positionData,
              ]) => (
                <>
                  <PageSEOTags
                    title="seo.title-product-w-tokens"
                    titleParams={{
                      // TODO remove ajna translation dependency
                      product: t(`seo.ajnaProductPage.title`, {
                        product: upperFirst(dpmPosition.product),
                      }),
                      protocol,
                      token1: dpmPosition.collateralToken,
                      token2: dpmPosition.quoteToken,
                    }}
                    // TODO remove ajna translation dependency
                    description="seo.ajna.description"
                    url={document.location.pathname}
                  />
                  <OmniGeneralContextProvider
                    collateralAddress={dpmPosition.collateralTokenAddress}
                    collateralBalance={collateralBalance}
                    collateralDigits={collateralDigits}
                    collateralPrecision={collateralPrecision}
                    collateralPrice={isOracless ? one : tokenPriceUSD[dpmPosition.collateralToken]}
                    collateralToken={dpmPosition.collateralToken}
                    collateralIcon={tokensIcons.collateralToken}
                    {...(flow === 'manage' && { dpmProxy: dpmPosition.proxy })}
                    ethBalance={ethBalance}
                    ethPrice={tokenPriceUSD.ETH}
                    flow={flow}
                    id={id}
                    isOracless={!!isOracless}
                    owner={dpmPosition.user}
                    product={dpmPosition.product as OmniProduct}
                    quoteAddress={dpmPosition.quoteTokenAddress}
                    quoteBalance={quoteBalance}
                    quoteDigits={quoteDigits}
                    quotePrecision={quotePrecision}
                    quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                    quoteToken={dpmPosition.quoteToken}
                    quoteIcon={tokensIcons.quoteToken}
                    steps={steps[dpmPosition.product as OmniProduct][flow]}
                    gasPrice={gasPrice}
                    slippage={slippage}
                    isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                  >
                    {controller({
                      dpmPosition,
                      flow,
                      aggregatedData: _aggregatedData,
                      positionData: _positionData,
                    })}
                  </OmniGeneralContextProvider>
                </>
              )}
            </WithLoadingIndicator>
          </WithErrorHandler>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
