import { type NetworkNames, getNetworkByName } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { OmniGeneralContextProvider } from 'features/omni-kit/contexts'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { useOmniProtocolData } from 'features/omni-kit/hooks'
import type { ProductDataProps } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniData'
import type { OmniFlow, OmniProductType, OmniSteps } from 'features/omni-kit/types'
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
  isOracless?: boolean
  networkName: NetworkNames
  positionId?: string
  productType?: OmniProductType
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
  isOracless = false,
  networkName,
  positionId,
  productType,
  protocol,
  protocolHook,
  quoteToken,
  seoTags,
  steps,
}: OmniProductControllerProps<A, H, P>) => {
  const { t } = useTranslation()

  const network = getNetworkByName(networkName)
  const flow = positionId ? 'manage' : 'open'

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
    id: positionId,
    isOracless,
    productType,
    protocol,
    quoteToken,
  })

  const {
    data: { aggregatedData, positionData },
    errors: protocolDataErrors,
  } = protocolHook({
    collateralToken,
    dpmPositionData,
    id: positionId,
    productType,
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
                    collateralIcon: tokensIconsData?.collateralToken,
                    collateralToken: dpmPositionData?.collateralToken,
                    flow,
                    id: positionId,
                    productType: dpmPositionData?.product as OmniProductType,
                    protocol,
                    quoteIcon: tokensIconsData?.quoteToken,
                    quoteToken: dpmPositionData?.quoteToken,
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
                    id={positionId}
                    isOracless={!!isOracless}
                    isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                    network={network}
                    owner={dpmPosition.user}
                    productType={dpmPosition.product as OmniProductType}
                    protocol={protocol}
                    quoteAddress={dpmPosition.quoteTokenAddress}
                    quoteBalance={quoteBalance}
                    quoteDigits={quoteDigits}
                    quoteIcon={tokensIcons.quoteToken}
                    quotePrecision={quotePrecision}
                    quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                    quoteToken={dpmPosition.quoteToken}
                    slippage={slippage}
                    steps={steps[dpmPosition.product as OmniProductType][flow]}
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
