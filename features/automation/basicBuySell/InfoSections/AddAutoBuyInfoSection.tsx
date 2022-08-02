import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BuyInfoSectionProps {
  token: string
  colRatioAfterBuy: BigNumber
  multipleAfterBuy: BigNumber
  nextBuyPrice: BigNumber
  execCollRatio: BigNumber
  slippageLimit?: BigNumber
  collateralAfterNextBuy: {
    value: BigNumber
    secondaryValue: BigNumber
  }
  outstandingDebtAfterNextBuy: {
    value: BigNumber
    secondaryValue: BigNumber
  }
  collateralToBePurchased: BigNumber
  targetRatioWithDeviationFloor: BigNumber
  targetRatioWithDeviationCeiling: BigNumber
}

export function AddAutoBuyInfoSection({
  colRatioAfterBuy,
  multipleAfterBuy,
  nextBuyPrice,
  collateralAfterNextBuy: collatAfterNextBuy,
  outstandingDebtAfterNextBuy,
  collateralToBePurchased,
  execCollRatio,
  token,
  targetRatioWithDeviationFloor,
  targetRatioWithDeviationCeiling,
}: BuyInfoSectionProps) {
  const { t } = useTranslation()

  const ratioToPerformBuyFormatted = formatPercent(execCollRatio, { precision: 2 })
  const collateralAfterNextBuyFormatted = formatCryptoBalance(collatAfterNextBuy.value)
  const nextCollateralAfterNextBuyFormatted = formatCryptoBalance(collatAfterNextBuy.secondaryValue)
  const outstandingDebtAfterBuyFormatted = formatCryptoBalance(outstandingDebtAfterNextBuy.value)
  const nextOutstandingDebtAfterBuyFormatted = formatCryptoBalance(
    outstandingDebtAfterNextBuy.secondaryValue,
  )
  const collateralToBePurchasedFormatted = formatCryptoBalance(collateralToBePurchased)
  const targetRatioWithDeviationFloorFormatted = formatPercent(targetRatioWithDeviationFloor)
  const targetRatioWithDeviationCeilingFormatted = formatPercent(targetRatioWithDeviationCeiling)
  const nextBuyPriceFormatted = formatAmount(nextBuyPrice, 'USD')

  return (
    <InfoSection
      title={t('auto-buy.buy-title')}
      items={[
        {
          label: t('auto-buy.target-col-ratio-each-buy'),
          value: `${colRatioAfterBuy}%`,
        },
        {
          label: t('auto-buy.target-multiple-each-buy'),
          value: `${multipleAfterBuy.toFixed(2)}x`,
        },
        {
          label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
          value: ratioToPerformBuyFormatted,
        },
        {
          label: t('auto-buy.next-buy-prices'),
          value: `$${nextBuyPriceFormatted}`,
        },
        {
          label: t('auto-buy.target-ratio-with-deviation'),
          value: `${targetRatioWithDeviationFloorFormatted} - ${targetRatioWithDeviationCeilingFormatted}`,
        },
        {
          label: t('auto-buy.collateral-after-next-buy'),
          value: collateralAfterNextBuyFormatted,
          secondaryValue: `${nextCollateralAfterNextBuyFormatted} ${token}`,
        },
        {
          label: t('auto-buy.outstanding-debt-after-next-buy'),
          value: outstandingDebtAfterBuyFormatted,
          secondaryValue: `${nextOutstandingDebtAfterBuyFormatted} DAI`,
        },
        {
          label: t('auto-buy.col-to-be-purchased', { token }),
          value: `${collateralToBePurchasedFormatted} ${token}`,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: <GasEstimation />,
        },
      ]}
    />
  )
}
