import BigNumber from 'bignumber.js'
import { amountFromWei } from 'blockchain/utils'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { SecondaryVariantType } from 'components/infoSection/Item'
import { LazySummerSidebarContent } from 'features/lazy-summer/components/LazySummerSidebarContent'
import {
  OmniGasEstimation,
  OmniSlippageInfoWithSettings,
} from 'features/omni-kit/components/sidebars'
import { useOmniGeneralContext, useOmniProductContext } from 'features/omni-kit/contexts'
import { omniExchangeQuote$ } from 'features/omni-kit/observables'
import {
  resolveIfCachedPosition,
  resolveIfCachedSwap,
  resolveSwapTokenPrice,
} from 'features/omni-kit/protocols/ajna/helpers'
import {
  OmniBorrowFormAction,
  OmniMultiplyFormAction,
  OmniMultiplyPanel,
  OmniProductType,
} from 'features/omni-kit/types'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatLtvDecimalAsPercent,
  formatUsdValue,
} from 'helpers/formatters/format'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { Box } from 'theme-ui'

const actionsWithSlippage = [
  OmniBorrowFormAction.AdjustBorrow,
  OmniBorrowFormAction.CloseBorrow,
  OmniMultiplyFormAction.AdjustMultiply,
  OmniMultiplyFormAction.CloseMultiply,
  OmniMultiplyFormAction.DepositCollateralMultiply,
  OmniMultiplyFormAction.DepositQuoteMultiply,
  OmniMultiplyFormAction.OpenMultiply,
  OmniMultiplyFormAction.WithdrawMultiply,
]
const actionsWithFee = [
  OmniMultiplyFormAction.AdjustMultiply,
  OmniMultiplyFormAction.DepositCollateralMultiply,
  OmniMultiplyFormAction.WithdrawMultiply,
]

export function OmniMultiplyFormOrder() {
  const { t } = useTranslation()
  const {
    environment: {
      collateralPrice,
      collateralToken,
      quotePrecision,
      collateralPrecision,
      quoteToken,
      slippage,
      isShort,
      quotePrice,
      networkId,
      slippageSource,
      isStrategyWithDefaultSlippage,
      owner,
    },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails, setSlippageSource },
  } = useOmniGeneralContext()
  const {
    form: {
      state: { action, loanToValue, uiDropdown, closeTo },
    },
    position: { cachedPosition, isSimulationLoading, currentPosition, swap },
    dynamicMetadata: {
      values: { shouldShowDynamicLtv, afterPositionDebt },
    },
  } = useOmniProductContext(OmniProductType.Multiply)

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached: isTxSuccess,
    cachedPosition,
    currentPosition,
  })

  const swapData = resolveIfCachedSwap({
    cached: isTxSuccess,
    currentSwap: swap?.current,
    cachedSwap: swap?.cached,
  })

  const tokenPrice = resolveSwapTokenPrice({ positionData, simulationData, swapData })

  const withSlippage = action && actionsWithSlippage.includes(action)

  const withBuyingCollateral =
    action === OmniMultiplyFormAction.OpenMultiply ||
    (actionsWithFee.includes(action as OmniMultiplyFormAction) &&
      loanToValue?.gt(positionData.riskRatio.loanToValue))

  const withSellingCollateral =
    action === OmniMultiplyFormAction.CloseMultiply ||
    (actionsWithFee.includes(action as OmniMultiplyFormAction) &&
      loanToValue?.lt(positionData.riskRatio.loanToValue))

  const quoteAction = withBuyingCollateral ? 'BUY_COLLATERAL' : 'SELL_COLLATERAL'
  // use ~1$ worth amount of collateral or quote token
  const quoteAmount = one.div(withBuyingCollateral ? quotePrice : collateralPrice)

  const initialQuote$ = useMemo(
    () =>
      omniExchangeQuote$({
        networkId,
        collateralToken,
        slippage,
        amount: quoteAmount,
        action: quoteAction,
        exchangeType: 'defaultExchange',
        quoteToken,
        walletAddress: owner,
      }),
    [quoteAmount.toString(), quoteAction],
  )

  const [initialQuote] = useObservable(initialQuote$)

  const buyingOrSellingCollateral = swapData
    ? withBuyingCollateral
      ? swapData.minToTokenAmount
      : swapData.fromTokenAmount
    : zero

  const priceImpact =
    initialQuote?.status === 'SUCCESS' && tokenPrice
      ? calculatePriceImpact(initialQuote.tokenPrice, tokenPrice).div(100)
      : undefined

  let oasisFee = zero
  if (swapData) {
    const feeToken =
      swapData?.collectFeeFrom === 'targetToken' ? swapData.targetToken : swapData.sourceToken

    if (feeToken && 'symbol' in feeToken && 'precision' in feeToken) {
      const price = feeToken.symbol === collateralToken ? collateralPrice : quotePrice

      oasisFee = amountFromWei(swapData.tokenFee, feeToken.precision).multipliedBy(price)
    } else {
      let feePrecision = quotePrecision
      let feePrice = quotePrice
      const collectingFromTarget = swapData.collectFeeFrom === 'targetToken'
      // buying collateral means the target token is the collateral token
      if (withBuyingCollateral) {
        feePrecision = collectingFromTarget ? collateralPrecision : quotePrecision
        feePrice = collectingFromTarget ? collateralPrice : quotePrice
        // selling collateral means the target token is the quote token
      } else if (withSellingCollateral) {
        feePrecision = collectingFromTarget ? quotePrecision : collateralPrecision
        feePrice = collectingFromTarget ? quotePrice : collateralPrice
      }
      oasisFee = amountFromWei(swapData.tokenFee, feePrecision).multipliedBy(feePrice)
    }
  }

  const isLoading = !isTxSuccess && isSimulationLoading
  const formatted = {
    totalExposure: `${formatCryptoBalance(positionData.collateralAmount)} ${collateralToken}`,
    afterTotalExposure:
      simulationData?.collateralAmount &&
      `${formatCryptoBalance(simulationData.collateralAmount)} ${collateralToken}`,
    multiple: `${positionData.riskRatio.multiple.toFixed(2)}x`,
    afterMultiple: simulationData?.riskRatio && `${simulationData.riskRatio.multiple.toFixed(2)}x`,
    slippageLimit: formatDecimalAsPercent(slippage),
    positionDebt: `${formatCryptoBalance(positionData.debtAmount)} ${quoteToken}`,
    afterPositionDebt:
      afterPositionDebt && `${formatCryptoBalance(afterPositionDebt)} ${quoteToken}`,
    loanToValue: formatLtvDecimalAsPercent(positionData.riskRatio.loanToValue),
    afterLoanToValue:
      simulationData?.riskRatio &&
      formatLtvDecimalAsPercent(
        simulationData.riskRatio.loanToValue.decimalPlaces(4, BigNumber.ROUND_DOWN),
      ),
    dynamicMaxLtv: formatDecimalAsPercent(positionData.maxRiskRatio.loanToValue),
    afterDynamicMaxLtv:
      simulationData?.maxRiskRatio.loanToValue &&
      formatDecimalAsPercent(simulationData.maxRiskRatio.loanToValue),
    buyingCollateral: `${formatCryptoBalance(buyingOrSellingCollateral)} ${collateralToken}`,
    buyingCollateralUSD: `$${formatAmount(
      buyingOrSellingCollateral.times(collateralPrice),
      'USD',
    )}`,
    sellingCollateral: `${formatCryptoBalance(buyingOrSellingCollateral)} ${collateralToken}`,
    sellingCollateralUSD: `$${formatAmount(
      buyingOrSellingCollateral.times(collateralPrice),
      'USD',
    )}`,
    marketPrice: tokenPrice
      ? `${formatCryptoBalance(
          isShort ? one.div(tokenPrice) : tokenPrice,
        )} ${collateralToken}/${quoteToken}`
      : 'n/a',
    marketPriceImpact: priceImpact ? formatDecimalAsPercent(priceImpact) : 'n/a',
    oasisFee: formatUsdValue(oasisFee),
    totalCost: txDetails?.txCost ? formatUsdValue(txDetails.txCost) : '-',
  }

  const withLazySummer = isTxSuccess && uiDropdown === OmniMultiplyPanel.Close

  return withLazySummer ? (
    <LazySummerSidebarContent
      closeToToken={closeTo === 'collateral' ? collateralToken : quoteToken}
    />
  ) : (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        ...(withBuyingCollateral
          ? [
              {
                label: t('vault-changes.buying-token', { token: collateralToken }),
                value: formatted.buyingCollateral,
                secondary: {
                  value: formatted.buyingCollateralUSD,
                },
                isLoading,
              },
            ]
          : []),
        ...(withSellingCollateral
          ? [
              {
                label: t('vault-changes.selling-token', { token: collateralToken }),
                value: formatted.sellingCollateral,
                secondary: {
                  value: formatted.sellingCollateralUSD,
                },
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.total-exposure', { token: collateralToken }),
          value: formatted.totalExposure,
          change: formatted.afterTotalExposure,
          isLoading,
        },
        ...(withBuyingCollateral || withSellingCollateral
          ? [
              {
                label: t('vault-changes.price-impact', {
                  token: `${collateralToken}/${quoteToken}`,
                }),
                value: formatted.marketPrice,
                secondary: {
                  value: formatted.marketPriceImpact,
                  variant: 'negative' as SecondaryVariantType,
                },
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.multiple'),
          value: formatted.multiple,
          change: formatted.afterMultiple,
          isLoading,
        },
        ...(withSlippage
          ? [
              {
                label: t('vault-changes.slippage-limit'),
                value: (
                  <OmniSlippageInfoWithSettings
                    slippage={formatted.slippageLimit}
                    getSlippageFrom={slippageSource}
                    changeSlippage={setSlippageSource}
                    withDefaultSlippage={isStrategyWithDefaultSlippage}
                  />
                ),
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.debt'),
          value: formatted.positionDebt,
          change: formatted.afterPositionDebt,
          isLoading,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.loanToValue,
          change: formatted.afterLoanToValue,
          isLoading,
        },
        ...(shouldShowDynamicLtv({ includeCache: true })
          ? [
              {
                label: t('system.dynamic-max-ltv'),
                value: formatted.dynamicMaxLtv,
                change: formatted.afterDynamicMaxLtv,
                isLoading,
              },
            ]
          : []),
        ...(isTxSuccess
          ? [
              {
                label: t('system.total-cost'),
                value: formatted.totalCost,
                isLoading,
              },
            ]
          : isFlowStateReady
            ? [
                {
                  label: t('transaction-fee'),
                  value: (
                    <>
                      {!oasisFee.isZero() && (
                        <>
                          {formatted.oasisFee}
                          <Box sx={{ mx: '4px' }}>+</Box>
                        </>
                      )}
                      <OmniGasEstimation />
                    </>
                  ),
                  dropdownValues: !oasisFee.isZero()
                    ? [
                        {
                          label: t('vault-changes.oasis-fee'),
                          value: formatted.oasisFee,
                        },
                        {
                          label: t('max-gas-fee'),
                          value: <OmniGasEstimation />,
                        },
                      ]
                    : undefined,
                  isLoading,
                },
              ]
            : []),
      ]}
    />
  )
}
