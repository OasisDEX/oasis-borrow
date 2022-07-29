import BigNumber from 'bignumber.js'
import { InfoSection } from 'components/infoSection/InfoSection'
import { formatAmount, formatCryptoBalance } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ConstantMultipleInfoSectionProps {
  token: string
  targetColRatio: BigNumber
  multiplier: number
  slippage: BigNumber
  triggerColRatioToBuy: BigNumber
  nextBuyPrice: BigNumber
  collateralToBePurchased: BigNumber
  maxPriceToBuy?: BigNumber
  triggerColRatioToSell: BigNumber
  nextSellPrice: BigNumber
  collateralToBeSold: BigNumber
  minPriceToSell?: BigNumber
  addTriggerGasEstimationUsd?: BigNumber
}

export function ConstantMultipleInfoSection({
  token,
  targetColRatio,
  multiplier,
  slippage,
  triggerColRatioToBuy,
  nextBuyPrice,
  collateralToBePurchased,
  maxPriceToBuy,
  triggerColRatioToSell,
  nextSellPrice,
  collateralToBeSold,
  minPriceToSell,
  addTriggerGasEstimationUsd,
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
          // TODO: PK calculate this value
          value: '$0',
        },
        {
          label: t('auto-sell.setup-transaction-cost'),
          value:
            addTriggerGasEstimationUsd && `$${formatAmount(addTriggerGasEstimationUsd, 'USD')}`,
          isLoading: addTriggerGasEstimationUsd === undefined,
        },
        {
          label: t('constant-multiple.vault-changes.buy-sell-trigger-summary'),
          isHeading: true,
          dropdownValues: [
            {
              label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
              value: `${triggerColRatioToBuy}%`,
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
              value: `${triggerColRatioToSell}%`,
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
