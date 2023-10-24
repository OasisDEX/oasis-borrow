import { type NetworkNames, getNetworkByName } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { OmniGeneralContextProvider } from 'features/omni-kit/contexts'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { useOmniProtocolData } from 'features/omni-kit/hooks'
import type { ProductDataProps } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniData'
import type { OmniFlow, OmniProduct, OmniSteps } from 'features/omni-kit/types'
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
  aggregatedData: { auction: A; history: H }
  dpmPosition: DpmPositionData
  flow: OmniFlow
  positionData: P
}

interface OmniProductControllerProps<A, H, P> {
  collateralToken?: string
  controller: (params: OmniProductsControllerProps<A, H, P>) => React.ReactNode
  flow: OmniFlow
  id?: string
  isOracless?: boolean
  networkName: NetworkNames
  product?: OmniProduct
  protocol: LendingProtocol
  protocolHook: (params: ProductDataProps) => {
    data: { aggregatedData: { auction: A; history: H } | undefined; positionData: P | undefined }
    errors: string[]
    isOracless: boolean
    redirect: string | undefined
  }
  quoteToken?: string
  seoTags: {
    productKey: string
    descriptionKey: string
  }
  steps: OmniSteps
}

export const OmniProductController = <A, H, P>({
  collateralToken,
  controller,
  flow,
  id,
  isOracless,
  networkName,
  product,
  protocol,
  protocolHook,
  quoteToken,
  seoTags,
  steps,
}: OmniProductControllerProps<A, H, P>) => {
  const { t } = useTranslation()

  const network = getNetworkByName(networkName)

  const {
    data: {
      balancesInfoArrayData,
      dpmPositionData,
      ethBalanceData,
      gasPriceData,
      tokenPriceUSDData,
      tokensIconsData,
      userSettingsData,
    },
    errors,
    tokensPrecision,
  } = useOmniProtocolData({
    collateralToken,
    id,
    isOracless,
    product,
    protocol,
    quoteToken,
  })

  const {
    data: { aggregatedData, positionData },
    errors: protocolDataErrors,
  } = protocolHook({
    collateralToken,
    dpmPositionData,
    id,
    product,
    quoteToken,
    tokenPriceUSDData,
  })

  return (
    <WithConnection pageChainId={network.hexId} includeTestNet={true}>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <WithErrorHandler error={[...errors, ...protocolDataErrors]}>
            <WithLoadingIndicator
              value={[
                aggregatedData,
                balancesInfoArrayData,
                dpmPositionData,
                ethBalanceData,
                gasPriceData,
                positionData,
                tokenPriceUSDData,
                tokensIconsData,
                tokensPrecision,
                userSettingsData,
              ]}
              customLoader={
                <PositionLoadingState
                  {...getOmniHeadlineProps({
                    collateralToken: dpmPositionData?.collateralToken,
                    flow,
                    product: dpmPositionData?.product as OmniProduct,
                    quoteToken: dpmPositionData?.quoteToken,
                    collateralIcon: tokensIconsData?.collateralToken,
                    quoteIcon: tokensIconsData?.quoteToken,
                    protocol,
                    id,
                  })}
                />
              }
            >
              {([
                _aggregatedData,
                [collateralBalance, quoteBalance],
                dpmPosition,
                [ethBalance],
                gasPrice,
                _positionData,
                tokenPriceUSD,
                tokensIcons,
                { collateralDigits, collateralPrecision, quoteDigits, quotePrecision },
                { slippage },
              ]) => (
                <>
                  <PageSEOTags
                    title="seo.title-product-w-tokens"
                    titleParams={{
                      product: t(seoTags.productKey, {
                        product: upperFirst(dpmPosition.product),
                      }),
                      protocol,
                      token1: dpmPosition.collateralToken,
                      token2: dpmPosition.quoteToken,
                    }}
                    description={seoTags.descriptionKey}
                    url={document.location.pathname}
                  />
                  <OmniGeneralContextProvider
                    collateralAddress={dpmPosition.collateralTokenAddress}
                    collateralBalance={collateralBalance}
                    collateralDigits={collateralDigits}
                    collateralIcon={tokensIcons.collateralToken}
                    collateralPrecision={collateralPrecision}
                    collateralPrice={isOracless ? one : tokenPriceUSD[dpmPosition.collateralToken]}
                    collateralToken={dpmPosition.collateralToken}
                    {...(flow === 'manage' && { dpmProxy: dpmPosition.proxy })}
                    ethBalance={ethBalance}
                    ethPrice={tokenPriceUSD.ETH}
                    flow={flow}
                    gasPrice={gasPrice}
                    id={id}
                    isOracless={!!isOracless}
                    isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                    network={network}
                    owner={dpmPosition.user}
                    product={dpmPosition.product as OmniProduct}
                    protocol={protocol}
                    quoteAddress={dpmPosition.quoteTokenAddress}
                    quoteBalance={quoteBalance}
                    quoteDigits={quoteDigits}
                    quoteIcon={tokensIcons.quoteToken}
                    quotePrecision={quotePrecision}
                    quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                    quoteToken={dpmPosition.quoteToken}
                    slippage={slippage}
                    steps={steps[dpmPosition.product as OmniProduct][flow]}
                  >
                    {controller({
                      aggregatedData: _aggregatedData,
                      dpmPosition,
                      flow,
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
