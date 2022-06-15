import { InfoSection } from 'components/infoSection/InfoSection'
import { DropDownValue } from 'components/infoSection/Item'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface SellInfoSectionProps {
  colRatioAfterSell: string
  multipleAfterSell: string
  ratiotoPeformSell: string
  nextSellPrice: {
    value: string
    dropDownValues: DropDownValue[]
  }
  setupTransactionCost: string
  slippageLimit: string
  collatAfterNextSell: {
    value: string
    secondaryValue: string
  }
  outstandingDebtAfterSell: {
    value: string
    secondaryValue: string
  }
  ethToBeSoldAtNextSell: string
  estimatedTransactionCost: {
    value: string
    dropDownValues: DropDownValue[]
  }
}

export function SellInfoSection({
  colRatioAfterSell,
  multipleAfterSell,
  ratiotoPeformSell,
  nextSellPrice,
  setupTransactionCost,
  slippageLimit,
  collatAfterNextSell,
  outstandingDebtAfterSell,
  ethToBeSoldAtNextSell,
  estimatedTransactionCost,
}: SellInfoSectionProps) {
  const { t } = useTranslation()

  return (
    <InfoSection
      title={t('auto-sell.sell-title')}
      items={[
        {
          label: t('auto-sell.target-col-ratio-each-sell'),
          value: `${colRatioAfterSell}%`,
        },
        {
          label: t('auto-sell.target-multiple-each-sell'),
          value: `${multipleAfterSell}x`,
        },
        {
          label: t('auto-sell.trigger-col-ratio-to-perfrom-sell'),
          value: `${ratiotoPeformSell}%`,
        },
        {
          label: t('auto-sell.next-sell-price'),
          value: `$${nextSellPrice.value}`,
          dropdownValues: nextSellPrice.dropDownValues,
        },
        {
          label: t('auto-sell.setup-transaction-cost'),
          value: `$${setupTransactionCost}`,
        },
        {
          label: t('auto-sell.slippage-limit'),
          value: `${slippageLimit}%`,
        },
        {
          label: t('auto-sell.slippage-limit'),
          value: `${slippageLimit}%`,
        },
        {
          label: t('auto-sell.collateral-after-next-sell'),
          value: collatAfterNextSell.value,
          secondaryValue: `${collatAfterNextSell.secondaryValue} ETH`,
        },
        {
          label: t('auto-sell.outstanding-debt-after-next-sell'),
          value: outstandingDebtAfterSell.value,
          secondaryValue: `${outstandingDebtAfterSell.secondaryValue} DAI`,
        },
        {
          label: t('auto-sell.eth-to-be-sold'),
          value: `${ethToBeSoldAtNextSell} ETH`,
        },
        {
          label: t('auto-sell.estimated-transaction-cost'),
          value: `$${estimatedTransactionCost.value}`,
          dropdownValues: estimatedTransactionCost.dropDownValues,
        },
      ]}
    />
  )
}
