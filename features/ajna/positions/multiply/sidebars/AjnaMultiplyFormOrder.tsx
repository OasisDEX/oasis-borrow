import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { SecondaryVariantType } from 'components/infoSection/Item'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quoteToken },
    steps: { isFlowStateReady },
    tx: { isTxSuccess, txDetails },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { action },
    },
    position: {
      isSimulationLoading,
      currentPosition: { position, simulation },
    },
  } = useAjnaProductContext('multiply')

  const withSlippage =
    action &&
    [
      'open-multiply',
      'deposit-collateral-multiply',
      'deposit-quote-multiply',
      'withdraw-multiply',
      'close-multiply',
    ].includes(action)
  // TODO: add condition for both withBuying and withSelling to check id they should be displayed for:
  // deposit-collateral-multiply, deposit-quote-multiply, withdraw-multiply
  const withBuying = action === 'open-multiply'
  const withSelling = action === 'close-multiply'
  const withOasisFee = withBuying || withSelling

  const slippageLimit = new BigNumber(0.005)
  const buyingCollateral = new BigNumber(1.1645)
  const sellingCollateral = new BigNumber(11.2)
  const priceImpact = new BigNumber(0.0064)
  const oasisFee = new BigNumber(withOasisFee ? 5.48 : zero)

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalExposure: `${position.collateralAmount} ${collateralToken}`,
    afterTotalExposure:
      simulation?.collateralAmount && `${simulation.collateralAmount} ${collateralToken}`,
    multiple: `${position.riskRatio.multiple.toFixed(2)}x`,
    afterMultiple: simulation?.riskRatio && `${simulation.riskRatio.multiple.toFixed(2)}x`,
    slippageLimit: formatDecimalAsPercent(slippageLimit),
    positionDebt: `${formatCryptoBalance(position.debtAmount)} ${quoteToken}`,
    afterPositionDebt:
      simulation?.debtAmount && `${formatCryptoBalance(simulation?.debtAmount)} ${quoteToken}`,
    loanToValue: formatDecimalAsPercent(position.riskRatio.loanToValue),
    afterLoanToValue:
      simulation?.riskRatio &&
      formatDecimalAsPercent(
        simulation.riskRatio.loanToValue.decimalPlaces(2, BigNumber.ROUND_DOWN),
      ),
    liquidationThreshold: formatDecimalAsPercent(position.maxRiskRatio.loanToValue),
    afterLiquidationThreshold:
      simulation?.maxRiskRatio.loanToValue &&
      formatDecimalAsPercent(simulation.maxRiskRatio.loanToValue),
    buyingCollateral: `${formatCryptoBalance(buyingCollateral)} ${collateralToken}`,
    buyingCollateralUSD: `$${formatAmount(buyingCollateral.times(collateralPrice), 'USD')}`,
    sellingCollateral: `${formatCryptoBalance(sellingCollateral)} ${collateralToken}`,
    sellingCollateralUSD: `$${formatAmount(sellingCollateral.times(collateralPrice), 'USD')}`,
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
        {
          label: t('system.liquidation-threshold'),
          value: formatted.liquidationThreshold,
          change: formatted.afterLiquidationThreshold,
          isLoading,
        },
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
