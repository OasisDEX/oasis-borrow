import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { SecondaryVariantType } from 'components/infoSection/Item'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { resolveIfCachedPosition } from 'features/ajna/positions/common/helpers/resolveIfCachedPosition'
import { resolveIfCachedSwap } from 'features/ajna/positions/common/helpers/resolveIfCachedSwap'
import { resolveSwapTokenPrice } from 'features/ajna/positions/common/helpers/resolveSwapTokenPrice'
import { calculatePriceImpact } from 'features/shared/priceImpact'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { OAZO_FEE } from 'helpers/multiply/calculations'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quoteToken, slippage },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { action },
    },
    position: { cachedPosition, isSimulationLoading, currentPosition, swap },
  } = useAjnaProductContext('multiply')

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
    ].includes(action)
  // TODO: add condition for both withBuying and withSelling to check id they should be displayed for:
  // deposit-collateral-multiply, deposit-quote-multiply, withdraw-multiply
  const withBuying =
    action === 'open-multiply' ||
    (action === 'adjust' &&
      simulationData?.riskRatio.loanToValue.gt(positionData.riskRatio.loanToValue))
  const withSelling =
    action === 'close-multiply' ||
    (action === 'adjust' &&
      simulationData?.riskRatio.loanToValue.lt(positionData.riskRatio.loanToValue))
  const withOasisFee = withBuying || withSelling

  const buyingOrSellingCollateral = swapData
    ? withBuying
      ? swapData.minToTokenAmount
      : swapData.fromTokenAmount
    : zero

  const priceImpact = calculatePriceImpact(tokenPrice || zero, collateralPrice)
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
        simulationData.riskRatio.loanToValue.decimalPlaces(2, BigNumber.ROUND_DOWN),
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
    collateralPrice: `$${formatAmount(collateralPrice, 'USD')}`,
    collateralPriceImpact: formatDecimalAsPercent(priceImpact),
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
                label: t('vault-changes.price-impact', { token: collateralToken }),
                value: formatted.collateralPrice,
                secondary: {
                  value: formatted.collateralPriceImpact,
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
                label: t('system.max-transaction-cost'),
                value: <GasEstimation addition={oasisFee} />,
                dropdownValues: oasisFee
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
