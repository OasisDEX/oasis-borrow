import { isCorrelatedPosition } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { getNetworkById } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import type { GetOmniMetadata } from 'features/omni-kit/contexts'
import { OmniGeneralContextProvider, OmniProductContextProvider } from 'features/omni-kit/contexts'
import { OmniLayoutController } from 'features/omni-kit/controllers'
import { getOmniHeadlineProps, getOmniProductContextProviderData } from 'features/omni-kit/helpers'
import { useOmniProtocolData } from 'features/omni-kit/hooks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type {
  OmniFormDefaults,
  OmniProductType,
  OmniProtocolHookProps,
  OmniProtocolSettings,
  OmniSupportedNetworkIds,
  OmniSupportedProtocols,
} from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useAccount } from 'helpers/useAccount'
import { one, zero } from 'helpers/zero'
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
  isOracless?: boolean
  networkId: OmniSupportedNetworkIds
  positionId?: string
  productType: OmniProductType
  protocol: OmniSupportedProtocols
  protocolHook: (params: OmniProtocolHookProps) => {
    data: {
      aggregatedData: { auction: Auction; history: History } | undefined
      positionData: Position | undefined
      protocolPricesData?: BigNumber[] | undefined
    }
    errors: string[]
  }
  quoteToken: string
  settings: OmniProtocolSettings
  seoTags: {
    productKey: string
    descriptionKey: string
  }
  shouldUseProtocolPrices?: boolean
  version?: string
}

export const OmniProductController = <Auction, History, Position>({
  collateralToken,
  customState = ({ children }) => <>{children}</>,
  isOracless = false,
  networkId,
  positionId,
  productType,
  protocol,
  protocolHook,
  quoteToken,
  settings,
  seoTags,
  version,
  shouldUseProtocolPrices,
}: OmniProductControllerProps<Auction, History, Position>) => {
  const { t } = useTranslation()

  const { replace } = useRouter()
  const { chainId, isConnected } = useAccount()

  const network = getNetworkById(networkId)
  const walletNetwork = getNetworkById(chainId || networkId)
  const isOpening = !positionId
  const protocolRaw = settings.rawName[networkId] as string

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
    positionId,
    isOracless,
    productType,
    protocol,
    protocolRaw,
    quoteToken,
    networkId,
  })

  const {
    data: { aggregatedData, positionData, protocolPricesData },
    errors: protocolDataErrors,
  } = protocolHook({
    collateralToken,
    dpmPositionData,
    networkId,
    quoteToken,
    tokenPriceUSDData,
    tokensPrecision,
    protocol,
  })

  useEffect(() => {
    if (dpmPositionData === null) void replace(INTERNAL_LINKS.notFound)
  }, [dpmPositionData])

  const isYieldLoop = isCorrelatedPosition(collateralToken, quoteToken)

  return (
    <WithConnection>
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
                ...(shouldUseProtocolPrices ? [protocolPricesData] : []),
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
                    networkName: network.name,
                    isYieldLoop,
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
                protocolPrices,
              ]) => {
                const castedProductType = dpmPosition.product as OmniProductType

                return (
                  <>
                    <PageSEOTags
                      title="seo.title-product-w-tokens"
                      titleParams={{
                        product: t(seoTags.productKey, {
                          productType: upperFirst(castedProductType),
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
                      collateralBalance={isConnected ? collateralBalance : zero}
                      collateralDigits={collateralDigits}
                      collateralIcon={tokensIcons.collateralToken}
                      collateralPrecision={collateralPrecision}
                      collateralPrice={
                        isOracless
                          ? one
                          : shouldUseProtocolPrices
                          ? protocolPrices[0]
                          : tokenPriceUSD[dpmPosition.collateralToken]
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
                      networkId={networkId}
                      owner={dpmPosition.user}
                      walletNetwork={walletNetwork}
                      positionId={positionId}
                      productType={castedProductType}
                      protocol={protocol}
                      protocolVersion={version}
                      protocolRaw={protocolRaw}
                      quoteAddress={dpmPosition.quoteTokenAddress}
                      quoteBalance={isConnected ? quoteBalance : zero}
                      quoteDigits={quoteDigits}
                      quoteIcon={tokensIcons.quoteToken}
                      quotePrecision={quotePrecision}
                      quotePrice={
                        isOracless
                          ? one
                          : shouldUseProtocolPrices
                          ? protocolPrices[1]
                          : tokenPriceUSD[dpmPosition.quoteToken]
                      }
                      quoteToken={dpmPosition.quoteToken}
                      settings={settings}
                      slippage={slippage}
                      steps={settings.steps[castedProductType][isOpening ? 'setup' : 'manage']}
                      isYieldLoop={isYieldLoop}
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
