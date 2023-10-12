import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { OmniKitGeneralContextProvider } from 'features/omni-kit/contexts/OmniKitGeneralContext'
import type { OmniKitMasterDataResponse } from 'features/omni-kit/hooks/useOmniKitMasterData'
import { type OmniKitProductPageProps, OmniKitSidebarStep } from 'features/omni-kit/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import React from 'react'

interface OmniKitProductControllerProps extends OmniKitProductPageProps {
  errors: any[]
  isLoaded?: boolean
  isOracless?: boolean
  isShort?: boolean
  masterData: OmniKitMasterDataResponse['data']
}

export function OmniKitProductController({
  errors,
  isLoaded,
  isOracless,
  isShort,
  masterData,
  network,
  productType,
  protocol,
}: OmniKitProductControllerProps) {
  return (
    <WithErrorHandler error={errors}>
      <WithLoadingIndicator value={[isLoaded]} customLoader={<PositionLoadingState />}>
        {() => {
          const {
            balancesInfoArrayData,
            dpmPositionData,
            ethBalanceData,
            gasPriceData,
            tokenPriceUSDData,
            tokensIconsData,
            tokensPrecisionData,
            userSettingsData,
          } = masterData

          if (
            balancesInfoArrayData &&
            dpmPositionData &&
            ethBalanceData &&
            gasPriceData &&
            tokenPriceUSDData &&
            tokensIconsData &&
            tokensPrecisionData &&
            userSettingsData
          ) {
            const [collateralBalance, quoteBalance] = balancesInfoArrayData
            const {
              collateralToken,
              collateralTokenAddress,
              hasMultiplePositions,
              proxy,
              quoteToken,
              quoteTokenAddress,
              user,
            } = dpmPositionData
            const [ethBalance] = ethBalanceData
            const { collateralTokenIcon, quoteTokenIcon } = tokensIconsData
            const { collateralDigits, collateralPrecision, quoteDigits, quotePrecision } =
              tokensPrecisionData
            const { slippage } = userSettingsData

            return (
              <OmniKitGeneralContextProvider
                collateralAddress={collateralTokenAddress}
                collateralBalance={collateralBalance}
                collateralDigits={collateralDigits}
                collateralPrecision={collateralPrecision}
                collateralPrice={tokenPriceUSDData[collateralToken]}
                collateralToken={collateralToken}
                collateralIcon={collateralTokenIcon}
                ethBalance={ethBalance}
                ethPrice={tokenPriceUSDData.ETH}
                isOracless={!!isOracless}
                owner={user}
                quoteAddress={quoteTokenAddress}
                quoteBalance={quoteBalance}
                quoteDigits={quoteDigits}
                quotePrecision={quotePrecision}
                quotePrice={tokenPriceUSDData[quoteToken]}
                quoteToken={quoteToken}
                quoteIcon={quoteTokenIcon}
                steps={[
                  OmniKitSidebarStep.Dpm,
                  OmniKitSidebarStep.Setup,
                  OmniKitSidebarStep.Dpm,
                  OmniKitSidebarStep.Transaction,
                ]}
                gasPrice={gasPriceData}
                slippage={slippage}
                isProxyWithManyPositions={hasMultiplePositions}
                isShort={!!isShort}
                network={network}
                productType={productType}
                protocol={protocol}
                dpmProxy={proxy}
              />
            )
          } else return <></>
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
