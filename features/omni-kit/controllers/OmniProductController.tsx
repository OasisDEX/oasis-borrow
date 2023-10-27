import { type NetworkNames, getNetworkByName } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { OmniGeneralContextProvider } from 'features/omni-kit/contexts'
import { getOmniHeadlineProps } from 'features/omni-kit/helpers'
import { useOmniProtocolData } from 'features/omni-kit/hooks'
import type { ProductDataProps } from 'features/omni-kit/protocols/ajna/hooks/useAjnaOmniData'
import type { OmniProductType, OmniSidebarStepsSet } from 'features/omni-kit/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface OmniProductsControllerProps<Auction, History, Position> {
  aggregatedData: { auction: Auction; history: History }
  dpmPosition: DpmPositionData
  isOpening: boolean
  positionData: Position
}

interface OmniProductControllerProps<Auction, History, Position> {
  collateralToken?: string
  controller: (params: OmniProductsControllerProps<Auction, History, Position>) => React.ReactNode
  isOracless?: boolean
  networkName: NetworkNames
  positionId?: string
  productType?: OmniProductType
  protocol: LendingProtocol
  protocolHook: (params: ProductDataProps) => {
    data: {
      aggregatedData: { auction: Auction; history: History } | undefined
      positionData: Position | undefined
    }
    errors: string[]
    isOracless: boolean
    redirect: string | undefined
  }
  quoteToken?: string
  seoTags: {
    productKey: string
    descriptionKey: string
  }
  steps: OmniSidebarStepsSet
}

export const OmniProductController = <Auction, History, Position>({
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
}: OmniProductControllerProps<Auction, History, Position>) => {
  const { t } = useTranslation()

  const network = getNetworkByName(networkName)
  const isOpening = !!positionId

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
    chainId: network.id,
    collateralToken,
    positionId,
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
    positionId,
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
                    positionId,
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
              ]) => {
                const productType = dpmPosition.product as OmniProductType

                return (
                  <>
                    <PageSEOTags
                      title="seo.title-product-w-tokens"
                      titleParams={{
                        product: t(seoTags.productKey, {
                          productType: upperFirst(productType),
                        }),
                        protocol: upperFirst(protocol),
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
                      collateralPrice={
                        isOracless ? one : tokenPriceUSD[dpmPosition.collateralToken]
                      }
                      collateralToken={dpmPosition.collateralToken}
                      {...(positionId && { dpmProxy: dpmPosition.proxy })}
                      ethBalance={ethBalance}
                      ethPrice={tokenPriceUSD.ETH}
                      gasPrice={gasPrice}
                      isOpening={isOpening}
                      isOracless={!!isOracless}
                      isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                      network={network}
                      owner={dpmPosition.user}
                      positionId={positionId}
                      productType={productType}
                      protocol={protocol}
                      quoteAddress={dpmPosition.quoteTokenAddress}
                      quoteBalance={quoteBalance}
                      quoteDigits={quoteDigits}
                      quoteIcon={tokensIcons.quoteToken}
                      quotePrecision={quotePrecision}
                      quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                      quoteToken={dpmPosition.quoteToken}
                      slippage={slippage}
                      steps={steps[productType][isOpening ? 'setup' : 'manage']}
                    >
                      {controller({
                        aggregatedData: _aggregatedData,
                        dpmPosition,
                        isOpening,
                        positionData: _positionData,
                      })}
                    </OmniGeneralContextProvider>
                  </>
                )
              }}
            </WithLoadingIndicator>
          </WithErrorHandler>
        </WithWalletAssociatedRisk>
      </WithTermsOfService>
    </WithConnection>
  )
}
