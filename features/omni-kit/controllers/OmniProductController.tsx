import { getNetworkById, getNetworkByName, type NetworkNames } from 'blockchain/networks'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import type { GetOmniMetadata } from 'features/omni-kit/contexts'
import { OmniGeneralContextProvider, OmniProductContextProvider } from 'features/omni-kit/contexts'
import { OmniLayoutController } from 'features/omni-kit/controllers'
import {
  getOmniHeadlineProps,
  getOmniProductContextProviderData,
  isOmniSupportedNetwork,
} from 'features/omni-kit/helpers'
import { useOmniProtocolData } from 'features/omni-kit/hooks'
import type { DpmPositionData } from 'features/omni-kit/observables'
import type { ProductDataProps } from 'features/omni-kit/protocols/ajna/hooks'
import type {
  OmniFormDefaults,
  OmniProductType,
  OmniSidebarStepsSet,
} from 'features/omni-kit/types'
import type { PositionHistoryEvent } from 'features/positionHistory/types'
import { WithTermsOfService } from 'features/termsOfService/TermsOfService'
import { WithWalletAssociatedRisk } from 'features/walletAssociatedRisk/WalletAssociatedRisk'
import { INTERNAL_LINKS } from 'helpers/applicationLinks'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import { useAccount } from 'helpers/useAccount'
import { one } from 'helpers/zero'
import type { LendingProtocol } from 'lendingProtocols'
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
  networkName: NetworkNames
  positionId?: string
  productType: OmniProductType
  protocol: LendingProtocol
  protocolRaw: string
  protocolHook: (params: ProductDataProps) => {
    data: {
      aggregatedData: { auction: Auction; history: History } | undefined
      positionData: Position | undefined
    }
    errors: string[]
    isOracless: boolean
    redirect: string | undefined
  }
  quoteToken: string
  seoTags: {
    productKey: string
    descriptionKey: string
  }
  steps: OmniSidebarStepsSet
}

export const OmniProductController = <Auction, History, Position>({
  collateralToken,
  customState = ({ children }) => <>{children}</>,
  isOracless = false,
  networkName,
  positionId,
  productType,
  protocol,
  protocolRaw,
  protocolHook,
  quoteToken,
  seoTags,
  steps,
}: OmniProductControllerProps<Auction, History, Position>) => {
  const { t } = useTranslation()

  const { replace } = useRouter()
  const { chainId } = useAccount()

  const positionNetwork = getNetworkByName(networkName)
  const walletNetwork = getNetworkById(chainId || positionNetwork.id)

  const resolvedNetwork =
    walletNetwork.testnet && positionNetwork.testnetId === walletNetwork.id
      ? walletNetwork
      : positionNetwork

  if (!isOmniSupportedNetwork(resolvedNetwork.id)) {
    throw new Error(`Unsupported network: ${resolvedNetwork.name}`)
  }

  const isOpening = !positionId

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
    networkId: resolvedNetwork.id,
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

  useEffect(() => {
    if (dpmPositionData === null) void replace(INTERNAL_LINKS.notFound)
  }, [dpmPositionData])

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
                      network={resolvedNetwork}
                      owner={dpmPosition.user}
                      walletNetwork={walletNetwork}
                      positionId={positionId}
                      productType={castedProductType}
                      protocol={protocol}
                      quoteAddress={dpmPosition.quoteTokenAddress}
                      quoteBalance={quoteBalance}
                      quoteDigits={quoteDigits}
                      quoteIcon={tokensIcons.quoteToken}
                      quotePrecision={quotePrecision}
                      quotePrice={isOracless ? one : tokenPriceUSD[dpmPosition.quoteToken]}
                      quoteToken={dpmPosition.quoteToken}
                      slippage={slippage}
                      steps={steps[castedProductType][isOpening ? 'setup' : 'manage']}
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
