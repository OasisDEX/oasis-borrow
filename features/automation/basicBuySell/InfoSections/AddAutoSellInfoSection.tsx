import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React, { ReactNode } from 'react'

interface SellInfoSectionProps {
  token: string
  targetCollRatio: BigNumber
  multipleAfterSell: BigNumber
  execCollRatio: BigNumber
  nextSellPrice: BigNumber
  slippageLimit?: BigNumber
  targetRatioWithDeviationFloor: BigNumber
  targetRatioWithDeviationCeiling: BigNumber
  collateralAfterNextSell: {
    value: BigNumber
    secondaryValue: BigNumber
  }
  outstandingDebtAfterSell: {
    value: BigNumber
    secondaryValue: BigNumber
  }
  ethToBeSoldAtNextSell: BigNumber
  estimatedTransactionCost: ReactNode
}

export function AddAutoSellInfoSection({
  token,
  targetCollRatio,
  multipleAfterSell,
  execCollRatio,
  nextSellPrice,
  collateralAfterNextSell,
  outstandingDebtAfterSell,
  ethToBeSoldAtNextSell,
  estimatedTransactionCost,
  targetRatioWithDeviationFloor,
  targetRatioWithDeviationCeiling,
}: SellInfoSectionProps) {
  const { t } = useTranslation()
  const collateralToBeSoldAtNextSellFormatted = formatCryptoBalance(ethToBeSoldAtNextSell)
  const multipleAfterSellFormatted = multipleAfterSell.toFixed(2)
  const outstandingDebtAfterSellFormatted = formatCryptoBalance(outstandingDebtAfterSell.value)
  const nextOutstandingDebtAfterSellFormatted = formatCryptoBalance(
    outstandingDebtAfterSell.secondaryValue,
  )
  const collateralAfterNextSellFormatted = formatCryptoBalance(collateralAfterNextSell.value)
  const nextCollateralAfterNextSellFormatted = formatCryptoBalance(
    collateralAfterNextSell.secondaryValue,
  )
  const nextSellPriceFormatted = formatAmount(nextSellPrice, 'USD')
  const colRatioAfterSellFormatted = formatPercent(targetCollRatio, { precision: 2 })
  const ratioToPerformSellFormatted = formatPercent(execCollRatio, { precision: 2 })

  const targetRatioWithDeviationFloorFormatted = formatPercent(targetRatioWithDeviationFloor)
  const targetRatioWithDeviationCeilingFormatted = formatPercent(targetRatioWithDeviationCeiling)

  return (
    <InfoSection
      title={t('auto-sell.sell-title')}
      items={[
        {
          label: t('auto-sell.target-col-ratio-each-sell'),
          value: colRatioAfterSellFormatted,
        },
        {
          label: t('auto-sell.target-multiple-each-sell'),
          value: `${multipleAfterSellFormatted}x`,
        },
        {
          label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
          value: ratioToPerformSellFormatted,
        },
        {
          label: t('auto-sell.next-sell-prices'),
          value: `$${nextSellPriceFormatted}`,
        },
        {
          label: t('auto-sell.target-ratio-with-deviation'),
          value: `${targetRatioWithDeviationFloorFormatted} - ${targetRatioWithDeviationCeilingFormatted}`,
        },
        {
          label: t('auto-sell.collateral-after-next-sell'),
          value: collateralAfterNextSellFormatted,
          secondaryValue: `${nextCollateralAfterNextSellFormatted} ${token}`,
        },
        {
          label: t('auto-sell.outstanding-debt-after-next-sell'),
          value: outstandingDebtAfterSellFormatted,
          secondaryValue: `${nextOutstandingDebtAfterSellFormatted} DAI`,
        },
        {
          label: t('auto-sell.col-to-be-sold', { token }),
          value: `${collateralToBeSoldAtNextSellFormatted} ${token}`,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: estimatedTransactionCost,
        },
      ]}
    />
  )
}
