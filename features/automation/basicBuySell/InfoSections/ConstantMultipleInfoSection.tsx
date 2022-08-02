import BigNumber from 'bignumber.js'
import { GasEstimation } from 'components/GasEstimation'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ConstantMultipleInfoSectionProps {
  token: string
  targetColRatio: BigNumber
  multiplier: number
  slippage: BigNumber
  buyExecutionCollRatio: BigNumber
  nextBuyPrice: BigNumber
  collateralToBePurchased: BigNumber
  maxPriceToBuy?: BigNumber
  sellExecutionCollRatio: BigNumber
  nextSellPrice: BigNumber
  collateralToBeSold: BigNumber
  minPriceToSell?: BigNumber
  estimatedOasisFee: BigNumber[]
  estimatedGasCostOnTrigger?: BigNumber
}

export function ConstantMultipleInfoSection({
  token,
  targetColRatio,
  multiplier,
  slippage,
  buyExecutionCollRatio,
  nextBuyPrice,
  collateralToBePurchased,
  maxPriceToBuy,
  sellExecutionCollRatio,
  nextSellPrice,
  collateralToBeSold,
  minPriceToSell,
  estimatedOasisFee,
  estimatedGasCostOnTrigger,
}: ConstantMultipleInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('constant-multiple.vault-changes.general-summary')}
      items={[
        {
          label: t('constant-multiple.vault-changes.target-col-ratio-after-buy-sell'),
          value: `${targetColRatio}%`,
        },
        {
          label: t('constant-multiple.vault-changes.target-multiple-ratio-after-buy-sell'),
          value: `${multiplier.toFixed(2)}x`,
        },
        {
          label: t('vault-changes.slippage-limit'),
          value: `${slippage}%`,
        },
        {
          label: t('constant-multiple.vault-changes.cost-per-adjustment'),
          value:
            estimatedGasCostOnTrigger &&
            estimatedOasisFee
              .map((feeItem) => {
                return `$${formatAmount(feeItem.plus(estimatedGasCostOnTrigger), 'USD')}`
              })
              .join(' - '),
          isLoading: estimatedGasCostOnTrigger === undefined,
          dropdownValues: [
            {
              label: t('constant-multiple.vault-changes.estimated-oasis-fee'),
              value: estimatedOasisFee
                .map((feeItem) => {
                  return `$${formatAmount(feeItem, 'USD')}`
                })
                .join(' - '),
            },
            {
              label: t('constant-multiple.vault-changes.estimated-max-gas-fee'),
              value:
                estimatedGasCostOnTrigger && `$${formatAmount(estimatedGasCostOnTrigger, 'USD')}`,
            },
          ],
        },
        {
          label: t('auto-sell.setup-transaction-cost'),
          value: <GasEstimation />,
        },
        {
          label: t('constant-multiple.vault-changes.buy-sell-trigger-summary'),
          isHeading: true,
          dropdownValues: [
            {
              label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
              value: `${buyExecutionCollRatio}%`,
            },
            {
              label: t('auto-buy.next-buy-prices'),
              value: `$${formatAmount(nextBuyPrice, 'USD')}`,
            },
            {
              label: t('auto-buy.col-to-be-purchased', { token }),
              value: `${formatCryptoBalance(collateralToBePurchased.abs())} ${token}`,
            },
            {
              label: t('constant-multiple.vault-changes.max-price-buy'),
              value: maxPriceToBuy
                ? `$${formatAmount(maxPriceToBuy, 'USD')}`
                : t('protection.no-threshold'),
            },
            {
              label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
              value: `${sellExecutionCollRatio}%`,
            },
            {
              label: t('auto-sell.next-sell-prices'),
              value: `$${formatAmount(nextSellPrice, 'USD')}`,
            },
            {
              label: t('auto-sell.col-to-be-sold', { token }),
              value: `${formatCryptoBalance(collateralToBeSold.abs())} ${token}`,
            },
            {
              label: t('constant-multiple.vault-changes.max-price-sell'),
              value: minPriceToSell
                ? `$${formatAmount(minPriceToSell, 'USD')}`
                : t('protection.no-threshold'),
            },
          ],
        },
      ]}
    />
  )
}
