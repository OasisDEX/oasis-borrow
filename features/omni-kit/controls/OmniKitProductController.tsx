import { PositionLoadingState } from 'components/vault/PositionLoadingState'
import { OmniKitContextProvider } from 'features/omni-kit/contexts/OmniKitContext'
import { OmniKitPositionController } from 'features/omni-kit/controls/OmniKitPositionController'
import type { OmniKitMasterDataResponse } from 'features/omni-kit/hooks/useOmniKitMasterData'
import type {
  OmniKitHooksGeneratorResponse,
  OmniKitProductPageProps,
} from 'features/omni-kit/types'
import { OmniKitSidebarStep } from 'features/omni-kit/types'
import { WithLoadingIndicator } from 'helpers/AppSpinner'
import { WithErrorHandler } from 'helpers/errorHandlers/WithErrorHandler'
import React from 'react'

interface OmniKitProductControllerProps extends OmniKitProductPageProps {
  errors: any[]
  hooks?: OmniKitHooksGeneratorResponse
  isLoaded?: boolean
  isOracless?: boolean
  isShort?: boolean
  masterData: OmniKitMasterDataResponse['data']
}

export function OmniKitProductController({
  errors,
  hooks,
  isLoaded,
  isOracless,
  isShort,
  masterData,
  network,
  positionId,
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
            hooks &&
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
              <OmniKitContextProvider
                collateralAddress={collateralTokenAddress}
                collateralBalance={collateralBalance}
                collateralDigits={collateralDigits}
                collateralIcon={collateralTokenIcon}
                collateralPrecision={collateralPrecision}
                collateralPrice={tokenPriceUSDData[collateralToken]}
                collateralToken={collateralToken}
                dpmProxy={proxy}
                ethBalance={ethBalance}
                ethPrice={tokenPriceUSDData.ETH}
                gasPrice={gasPriceData}
                hooks={hooks}
                isOracless={!!isOracless}
                isProxyWithManyPositions={hasMultiplePositions}
                isShort={!!isShort}
                network={network}
                owner={user}
                positionId={positionId}
                productType={productType}
                protocol={protocol}
                quoteAddress={quoteTokenAddress}
                quoteBalance={quoteBalance}
                quoteDigits={quoteDigits}
                quoteIcon={quoteTokenIcon}
                quotePrecision={quotePrecision}
                quotePrice={tokenPriceUSDData[quoteToken]}
                quoteToken={quoteToken}
                slippage={slippage}
                steps={[
                  OmniKitSidebarStep.Dpm,
                  OmniKitSidebarStep.Setup,
                  OmniKitSidebarStep.Dpm,
                  OmniKitSidebarStep.Transaction,
                ]}
              >
                <OmniKitPositionController />
              </OmniKitContextProvider>
            )
          } else return <></>
        }}
      </WithLoadingIndicator>
    </WithErrorHandler>
  )
}
