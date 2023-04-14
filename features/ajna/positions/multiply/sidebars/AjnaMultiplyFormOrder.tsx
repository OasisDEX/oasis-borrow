import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import {
  formatAmount,
  formatCryptoBalance,
  formatDecimalAsPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralPrice, collateralToken, quoteToken },
    tx: { isTxSuccess, txDetails },
  } = useAjnaGeneralContext()
  const {
    form: {
      state: { action },
    },
    position: { isSimulationLoading },
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
  const withBuying = action === 'deposit-quote-multiply'
  const withSelling = action === 'close-multiply'

  const totalExposure = new BigNumber(22461.32)
  const afterTotalExposure = new BigNumber(28436.37)
  const multiple = new BigNumber(1.5)
  const afterMultiple = new BigNumber(1.67)
  const slippageLimit = new BigNumber(0.005)
  const positionDebt = new BigNumber(5)
  const afterPositionDebt = new BigNumber(124.13)
  const loanToValue = new BigNumber(0.6265)
  const afterLoanToValue = new BigNumber(0.7141)
  const buyingCollateral = new BigNumber(1.1645)
  const sellingCollateral = new BigNumber(11.2)

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalExposure: `${totalExposure} ${collateralToken}`,
    afterTotalExposure: `${afterTotalExposure} ${collateralToken}`,
    multiple: `${multiple.toFixed(2)}x`,
    afterMultiple: afterMultiple && `${afterMultiple.toFixed(2)}x`,
    slippageLimit: formatDecimalAsPercent(slippageLimit),
    positionDebt: `${formatCryptoBalance(positionDebt)} ${quoteToken}`,
    afterPositionDebt: `${formatCryptoBalance(afterPositionDebt)} ${quoteToken}`,
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    buyingCollateral: `${formatCryptoBalance(buyingCollateral)} ${collateralToken}`,
    sellingCollateral: `${formatCryptoBalance(sellingCollateral)} ${collateralToken}`,
    collateralPrice: `$${formatAmount(collateralPrice, 'USD')}`,
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
                isLoading,
              },
            ]
          : []),
        ...(withSelling
          ? [
              {
                label: t('vault-changes.selling-token', { token: collateralToken }),
                value: formatted.sellingCollateral,
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.total-exposure', { token: collateralToken }),
          value: formatted.totalExposure,
          secondaryValue: formatted.afterTotalExposure,
          isLoading,
        },
        ...(withBuying || withSelling
          ? [
              {
                label: t('vault-changes.price-impact', { token: collateralToken }),
                value: formatted.collateralPrice,
                isLoading,
              },
            ]
          : []),
        {
          label: t('system.multiple'),
          value: formatted.multiple,
          secondaryValue: formatted.afterMultiple,
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
          secondaryValue: formatted.afterPositionDebt,
          isLoading,
        },
        {
          label: t('vault-changes.ltv'),
          value: formatted.loanToValue,
          secondaryValue: formatted.afterLoanToValue,
          isLoading,
        },
        isTxSuccess && cached
          ? {
              label: t('system.total-cost'),
              value: formatted.totalCost,
              isLoading,
            }
          : {
              label: t('system.max-transaction-cost'),
              value: <GasEstimation />,
              isLoading,
            },
      ]}
    />
  )
}
