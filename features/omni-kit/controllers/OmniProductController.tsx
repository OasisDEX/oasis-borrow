import { NetworkHexIds } from 'blockchain/networks'
import type { Tickers } from 'blockchain/prices.types'
import { WithConnection } from 'components/connectWallet'
import { PageSEOTags } from 'components/HeadTags'
import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { steps } from 'features/ajna/common/consts'
import { getAjnaHeadlineProps } from 'features/ajna/positions/common/helpers/getAjnaHeadlineProps'
import type { DpmPositionData } from 'features/ajna/positions/common/observables/getDpmPositionData'
import { OmniGeneralContextProvider } from 'features/omni-kit/contexts/OmniGeneralContext'
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
import type { FC } from 'react'
import React from 'react'

export interface ProductsControllerProps {
  id?: string
  product?: OmniProduct
  flow: OmniFlow
  protocol: LendingProtocol
  dpmPosition: DpmPositionData
  tokenPriceUSD: Tickers
  quoteToken?: string
  collateralToken?: string
  tokensIcons: any
}

interface ProtocolProductControllerProps {
  protocol: LendingProtocol
  collateralToken?: string
  id?: string
  flow: OmniFlow
  product?: OmniProduct
  quoteToken?: string
  controller: (params: ProductsControllerProps) => React.ReactNode
}

export const OmniProductController: FC<ProtocolProductControllerProps> = ({
  protocol,
  collateralToken,
  flow,
  id,
  product,
  quoteToken,
  controller,
}) => {
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
  })

  // TODO we will need isOracless mapping per specific protocol
  const isOracless = false

  return (
    <WithConnection pageChainId={NetworkHexIds.MAINNET} includeTestNet={true}>
      <WithTermsOfService>
        <WithWalletAssociatedRisk>
          <WithErrorHandler error={errors}>
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
                      product,
                      tokenPriceUSD,
                      quoteToken,
                      collateralToken,
                      protocol,
                      id,
                      flow,
                      tokensIcons,
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
