import { InfoSection } from 'components/infoSection/InfoSection'
import { DropDownValue } from 'components/infoSection/Item'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface BuyInfoSectionProps {
  colRatioAfterBuy: string
  multipleAfterBuy: string
  ratiotoPeformBuy: string
  nextBuyPrice: {
    value: string
    dropDownValues: DropDownValue[]
  }
  totalCostOfNextBuy: string
  slippageLimit: string
  collatAfterNextBuy: {
    value: string
    secondaryValue: string
  }
  outstandingDebtAfterNextBuy: {
    value: string
    secondaryValue: string
  }
  ethToBePurchased: string
  estimatedTransactionCost: {
    value: string
    dropDownValues: DropDownValue[]
  }
}

export function BuyInfoSection({
  colRatioAfterBuy,
  multipleAfterBuy,
  ratiotoPeformBuy,
  nextBuyPrice,
  totalCostOfNextBuy,
  slippageLimit,
  collatAfterNextBuy,
  outstandingDebtAfterNextBuy,
  ethToBePurchased,
  estimatedTransactionCost,
}: BuyInfoSectionProps) {
  const { t } = useTranslation()

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
          value: `${multipleAfterBuy}x`,
        },
        {
          label: t('auto-buy.trigger-col-ratio-to-perfrom-buy'),
          value: `${ratiotoPeformBuy}%`,
        },
        {
          label: t('auto-buy.next-buy-prices'),
          value: `$${nextBuyPrice.value}`,
          dropdownValues: nextBuyPrice.dropDownValues,
        },
        {
          label: t('auto-buy.setup-transaction-cost'),
          value: `$${totalCostOfNextBuy}`,
        },
        {
          label: t('auto-buy.slippage-limit'),
          value: `${slippageLimit}%`,
        },
        {
          label: t('auto-buy.collateral-after-next-buy'),
          value: collatAfterNextBuy.value,
          secondaryValue: `${collatAfterNextBuy.secondaryValue} ETH`,
        },
        {
          label: t('auto-buy.outstanding-debt-after-next-buy'),
          value: outstandingDebtAfterNextBuy.value,
          secondaryValue: `${outstandingDebtAfterNextBuy.secondaryValue} DAI`,
        },
        {
          label: t('auto-buy.eth-to-be-purchased'),
          value: `${ethToBePurchased} ETH`,
        },
        {
          label: t('auto-buy.estimated-transaction-cost'),
          value: `$${estimatedTransactionCost.value}`,
          dropdownValues: estimatedTransactionCost.dropDownValues,
        },
      ]}
    />
  )
}
