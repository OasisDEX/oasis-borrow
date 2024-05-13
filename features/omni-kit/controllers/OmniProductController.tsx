import { getNetworkById } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { OmniGeneralContextProvider, OmniProductContextProvider } from 'features/omni-kit/contexts'
import { OmniLayoutController } from 'features/omni-kit/controllers'
import {
  getOmniExtraTokenData,
  getOmniHeadlineProps,
  getOmniIsOmniYieldLoop,
  getOmniProductContextProviderData,
  getOmniRawProtocol,
} from 'features/omni-kit/helpers'
import { isYieldLoopPair } from 'features/omni-kit/helpers/isYieldLoopPair'
import { useOmniProtocolData, useOmniTriggersData } from 'features/omni-kit/hooks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import {
  getAutomationFormDefaults,
  useOmniAutomationFormReducto,
} from 'features/omni-kit/state/automation/common'
import type {
  GetOmniMetadata,
  OmniFormDefaults,
  OmniProtocolHookProps,
  OmniProtocolSettings,
  OmniSupportedNetworkIds,
  OmniSupportedProtocols,
} from 'features/omni-kit/types'
import { OmniProductType, OmniSidebarAutomationStep } from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useAccount } from 'helpers/useAccount'
import { one, zero } from 'helpers/zero'
import { LendingProtocolLabel } from 'lendingProtocols'
import { upperFirst } from 'lodash'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import React, { type ReactNode, useEffect } from 'react'

export interface OmniCustomStateParams<Auction, History, Position> {
  aggregatedData: { auction: Auction; history: History }
  children: (params: {
    formDefaults?: OmniFormDefaults
    useDynamicMetadata: GetOmniMetadata
    useTxHandler: () => () => void
  }) => ReactNode
  dpmPosition: DpmPositionData
  isOpening: boolean
  positionData: Position
}

interface OmniProductControllerProps<Auction, History, Position> {
  collateralToken: string
  customState?: (params: OmniCustomStateParams<Auction, History, Position>) => ReactNode
  extraTokens?: string[]
  isOracless?: boolean
  label?: string
  networkId: OmniSupportedNetworkIds
  pairId: number
  positionId?: string
  productType: OmniProductType
  protocol: OmniSupportedProtocols
  protocolHook: (params: OmniProtocolHookProps) => {
    data: {
      aggregatedData?: { auction: Auction; history: History }
      poolId?: string
      positionData?: Position
      protocolPricesData?: Tickers
    }
    errors: string[]
  }
  pseudoProtocol?: string
  quoteToken: string
  settings: OmniProtocolSettings
  seoTags: {
    productKey: string
    descriptionKey: string
  }
  version?: string
}

export const OmniProductController = <Auction, History, Position>({
  collateralToken,
  customState = ({ children }) => <>{children}</>,
  extraTokens = [],
  isOracless = false,
  label,
  networkId,
  pairId,
  positionId,
  productType,
  protocol,
  protocolHook,
  pseudoProtocol,
  quoteToken,
  seoTags,
  settings,
  version,
}: OmniProductControllerProps<Auction, History, Position>) => {
  const { t } = useTranslation()

  const { replace } = useRouter()
  const { chainId, isConnected } = useAccount()

  const network = getNetworkById(networkId)
  const walletNetwork = getNetworkById(chainId || networkId)
  const isOpening = !positionId
  const protocolRaw = getOmniRawProtocol({
    networkId,
    settings,
    label,
    pseudoProtocol,
  })

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
    extraTokens,
    isOracless,
    networkId,
    pairId,
    positionId,
    productType,
    protocol,
    protocolRaw,
    quoteToken,
  })

  const {
    data: { aggregatedData, poolId, positionData, protocolPricesData },
    errors: protocolDataErrors,
  } = protocolHook({
    collateralToken,
    dpmPositionData,
    label,
    networkId,
    pairId,
    protocol,
    quoteToken,
    tokenPriceUSDData,
    tokensPrecision,
  })

  const {
    data: { positionTriggersData },
    errors: triggersDataErrors,
  } = useOmniTriggersData({
    dpmPositionData,
    isOpening,
    networkId,
    poolId,
    protocol,
    settings,
  })

  useEffect(() => {
    if (dpmPositionData === null) void replace(INTERNAL_LINKS.notFound)
  }, [dpmPositionData])

  const isYieldLoop = getOmniIsOmniYieldLoop({ collateralToken, pseudoProtocol, quoteToken })
  // Flag to determine whether full yield-loop UI experience is available for given protocol & pair
  const isYieldLoopWithData =
    isYieldLoopPair({ collateralToken, debtToken: quoteToken }) &&
    productType === OmniProductType.Multiply

  return (
    <WithConnection>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <WithErrorHandler error={[...errors, ...protocolDataErrors, ...triggersDataErrors]}>
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
                protocolPricesData,
                positionTriggersData,
              ]}
              customLoader={
                <PositionLoadingState
                  {...getOmniHeadlineProps({
                    collateralIcon: tokensIconsData?.collateralToken,
                    collateralToken: dpmPositionData?.collateralToken,
                    headline: label,
                    positionId,
                    productType: dpmPositionData?.product as OmniProductType,
                    protocol,
                    quoteIcon: tokensIconsData?.quoteToken,
                    quoteToken: dpmPositionData?.quoteToken,
                    networkName: network.name,
                    isYieldLoopWithData,
                  })}
                />
              }
            >
              {([
                _aggregatedData,
                [collateralBalance, quoteBalance, ...extraBalances],
                dpmPosition,
                [ethBalance],
                gasPrice,
                _positionData,
                tokenPriceUSD,
                tokensIcons,
                { collateralDigits, collateralPrecision, quoteDigits, quotePrecision },
                { slippage },
                protocolPrices,
                positionTriggers,
              ]) => {
                const castedProductType = dpmPosition.product as OmniProductType
                const extraTokensData = getOmniExtraTokenData({
                  extraBalances,
                  extraTokens,
                  protocolPrices,
                })

                return (
                  <>
                    <PageSEOTags
                      title={
                        dpmPosition.collateralToken !== dpmPosition.quoteToken
                          ? 'seo.title-product-w-tokens'
                          : 'seo.title-product-wo-tokens'
                      }
                      titleParams={{
                        product: t(seoTags.productKey, {
                          productType: upperFirst(castedProductType),
                        }),
                        protocol: label ?? upperFirst(LendingProtocolLabel[protocol]),
                        token1: dpmPosition.collateralToken,
                        token2: dpmPosition.quoteToken,
                      }}
                      description={seoTags.descriptionKey}
                      url={document.location.pathname}
                    />
                    <OmniGeneralContextProvider
                      collateralAddress={dpmPosition.collateralTokenAddress}
                      collateralBalance={isConnected ? collateralBalance : zero}
                      collateralDigits={collateralDigits}
                      collateralIcon={tokensIcons.collateralToken}
                      collateralPrecision={collateralPrecision}
                      collateralPrice={
                        isOracless ? one : protocolPrices[dpmPosition.collateralToken]
                      }
                      collateralToken={dpmPosition.collateralToken}
                      {...(positionId && { dpmProxy: dpmPosition.proxy })}
                      ethBalance={ethBalance}
                      ethPrice={tokenPriceUSD.ETH}
                      extraTokensData={extraTokensData}
                      gasPrice={gasPrice}
                      isOpening={isOpening}
                      isOracless={!!isOracless}
                      isProxyWithManyPositions={dpmPosition.hasMultiplePositions}
                      isYieldLoop={isYieldLoop}
                      isYieldLoopWithData={isYieldLoopWithData}
                      label={label}
                      network={network}
                      networkId={networkId}
                      owner={dpmPosition.user}
                      pairId={pairId}
                      poolId={poolId}
                      positionId={positionId}
                      productType={castedProductType}
                      protocol={protocol}
                      protocolPrices={protocolPrices}
                      protocolRaw={protocolRaw}
                      protocolVersion={version}
                      walletNetwork={walletNetwork}
                      pseudoProtocol={pseudoProtocol}
                      quoteAddress={dpmPosition.quoteTokenAddress}
                      quoteBalance={isConnected ? quoteBalance : zero}
                      quoteDigits={quoteDigits}
                      quoteIcon={tokensIcons.quoteToken}
                      quotePrecision={quotePrecision}
                      quotePrice={isOracless ? one : protocolPrices[dpmPosition.quoteToken]}
                      quoteToken={dpmPosition.quoteToken}
                      settings={settings}
                      slippage={slippage}
                      steps={settings.steps[castedProductType][isOpening ? 'setup' : 'manage']}
                      automationSteps={[
                        OmniSidebarAutomationStep.Manage,
                        OmniSidebarAutomationStep.Transaction,
                      ]}
                    >
                      {customState({
                        aggregatedData: _aggregatedData,
                        dpmPosition,
                        isOpening,
                        positionData: _positionData,
                        children: ({
                          formDefaults = {
                            borrow: {},
                            earn: {},
                            multiply: {},
                          },
                          useDynamicMetadata,
                          useTxHandler,
                        }) => {
                          const omniProductContextProviderCommons = {
                            getDynamicMetadata: useDynamicMetadata,
                            positionAuction: _aggregatedData.auction,
                            positionHistory: _aggregatedData.history as PositionHistoryEvent[],
                            positionTriggers: positionTriggers,
                            automationFormReducto: useOmniAutomationFormReducto,
                            automationFormDefaults: getAutomationFormDefaults({
                              poolId,
                              positionTriggers,
                              protocol,
                            }),
                          }
                          const omniProductContextProviderData = getOmniProductContextProviderData({
                            formDefaults,
                            isOpening,
                            positionData: _positionData,
                            productType: castedProductType,
                          })

                          return (
                            <OmniProductContextProvider
                              {...omniProductContextProviderCommons}
                              {...omniProductContextProviderData}
                            >
                              <OmniLayoutController txHandler={useTxHandler} />
                            </OmniProductContextProvider>
                          )
                        },
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
