import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { useAjnaGeneralContext } from 'features/ajna/positions/common/contexts/AjnaGeneralContext'
import { useAjnaProductContext } from 'features/ajna/positions/common/contexts/AjnaProductContext'
import { formatAmount, formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

export function AjnaMultiplyFormOrder({ cached = false }: { cached?: boolean }) {
  const { t } = useTranslation()
  const {
    environment: { collateralToken, quoteToken },
    tx: { isTxSuccess, txDetails },
  } = useAjnaGeneralContext()
  const {
    position: { isSimulationLoading },
  } = useAjnaProductContext('multiply')

  const totalExposure = new BigNumber(22461.32)
  const afterTotalExposure = new BigNumber(28436.37)
  const multiple = new BigNumber(1.5)
  const afterMultiple = new BigNumber(1.67)
  const slippageLimit = new BigNumber(0.05)
  const outstandingDebt = new BigNumber(124.13)
  const loanToValue = new BigNumber(0.6265)
  const afterLoanToValue = new BigNumber(0.7141)

  const isLoading = !cached && isSimulationLoading
  const formatted = {
    totalExposure: `${totalExposure} ${collateralToken}`,
    afterTotalExposure: `${afterTotalExposure} ${collateralToken}`,
    multiple: `${multiple.toFixed(2)}x`,
    afterMultiple: afterMultiple && `${afterMultiple.toFixed(2)}x`,
    slippageLimit: formatDecimalAsPercent(slippageLimit),
    positionDebt: `${formatCryptoBalance(outstandingDebt)} ${quoteToken}`,
    loanToValue: formatDecimalAsPercent(loanToValue),
    afterLoanToValue: afterLoanToValue && formatDecimalAsPercent(afterLoanToValue),
    totalCost: txDetails?.txCost ? `$${formatAmount(txDetails.txCost, 'USD')}` : '-',
  }

  return (
    <InfoSection
      title={t('vault-changes.order-information')}
      items={[
        {
          label: t('system.total-exposure', { token: collateralToken }),
          value: formatted.totalExposure,
          secondaryValue: formatted.afterTotalExposure,
          isLoading,
        },
        {
          label: t('system.multiple'),
          value: formatted.multiple,
          secondaryValue: formatted.afterMultiple,
          isLoading,
        },
        {
          label: t('vault-changes.slippage-limit'),
          value: formatted.slippageLimit,
          isLoading,
        },
        {
          label: t('vault-changes.outstanding-debt'),
          value: formatted.positionDebt,
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
