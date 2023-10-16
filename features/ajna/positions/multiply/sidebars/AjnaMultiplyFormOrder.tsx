import BigNumber from 'bignumber.js'
import { useProductContext } from 'components/context/ProductContextProvider'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import type { SecondaryVariantType } from 'components/infoSection/Item'
import { useGenericProductContext } from 'features/ajna/positions/common/contexts/GenericProductContext'
import { useProtocolGeneralContext } from 'features/ajna/positions/common/contexts/ProtocolGeneralContext'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { resolveIfCachedSwap } from 'features/ajna/positions/common/helpers/resolveIfCachedSwap'
import { resolveSwapTokenPrice } from 'features/ajna/positions/common/helpers/resolveSwapTokenPrice'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { OAZO_FEE } from 'helpers/multiply/calculations.constants'
import { useObservable } from 'helpers/observableHook'
import { one, zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box } from 'theme-ui'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const { exchangeQuote$ } = useProductContext()
  const {
    environment: { collateralPrice, collateralToken, quoteToken, slippage, isShort, quotePrice },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useProtocolGeneralContext()
  const {
    form: {
      state: { action, loanToValue },
    },
    position: { cachedPosition, isSimulationLoading, currentPosition, swap },
  } = useGenericProductContext('multiply')

  const { positionData, simulationData } = resolveIfCachedPosition({
    cached,
    cachedPosition,
    currentPosition,
  })

  const swapData = resolveIfCachedSwap({
    cached,
    currentSwap: swap?.current,
    cachedSwap: swap?.cached,
  })

  const tokenPrice = resolveSwapTokenPrice({ positionData, simulationData, swapData })

  const withSlippage =
    action &&
    [
      'open-multiply',
      'adjust',
      'deposit-collateral-multiply',
      'deposit-quote-multiply',
      'withdraw-multiply',
      'close-multiply',
      'close-borrow',
      'adjust-borrow',
    ].includes(action)

  const withBuying =
    action === 'open-multiply' ||
    (['adjust', 'deposit-collateral-multiply', 'withdraw-multiply'].includes(action as string) &&
      loanToValue?.gt(positionData.riskRatio.loanToValue))
  const withSelling =
    action === 'close-multiply' ||
    (['adjust', 'deposit-collateral-multiply', 'withdraw-multiply'].includes(action as string) &&
      loanToValue?.lt(positionData.riskRatio.loanToValue))
  const withOasisFee = withBuying || withSelling

  const initialQuote$ = exchangeQuote$(
    collateralToken,
    slippage,
    // use ~1$ worth amount of collateral or quote token
    one.div(withBuying ? quotePrice : collateralPrice),
    withBuying ? 'BUY_COLLATERAL' : 'SELL_COLLATERAL',
    'defaultExchange',
    quoteToken,
  )

  const [initialQuote] = useObservable(initialQuote$)

  const buyingOrSellingCollateral = swapData
    ? withBuying
      ? swapData.minToTokenAmount
      : swapData.fromTokenAmount
    : zero

  const priceImpact =
    initialQuote?.status === 'SUCCESS' && tokenPrice
      ? calculatePriceImpact(initialQuote.tokenPrice, tokenPrice).div(100)
      : undefined

  const oasisFee = withOasisFee
    ? buyingOrSellingCollateral.times(OAZO_FEE.times(collateralPrice))
    : zero

  const isLoading = !cached && isSimulationLoading
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
      simulationData?.debtAmount &&
      `${formatCryptoBalance(simulationData?.debtAmount)} ${quoteToken}`,
    loanToValue: formatDecimalAsPercent(positionData.riskRatio.loanToValue),
    afterLoanToValue:
      simulationData?.riskRatio &&
      formatDecimalAsPercent(
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
    oasisFee: `$${formatAmount(oasisFee, 'USD')}`,
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        ...(withBuying
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
        ...(withSelling
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
        ...(withBuying || withSelling
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
                value: formatted.slippageLimit,
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
        ...(positionData.pool.lowestUtilizedPriceIndex.gt(zero)
          ? [
              {
                label: t('system.dynamic-max-ltv'),
                value: formatted.dynamicMaxLtv,
                change: formatted.afterDynamicMaxLtv,
                isLoading,
              },
            ]
          : []),
        ...(isTxSuccess && cached
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
                    <GasEstimation />
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
                        value: <GasEstimation />,
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
