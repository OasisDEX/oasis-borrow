import { InfoSection } from "components/infoSection/InfoSection";
import { DropDownValue } from "components/infoSection/Item";
import { useTranslation } from "next-i18next";

interface BuyInfoSectionProps {
  colRatioAfterBuy: string;
  multipleAfterBuy: string;
  ratiotoPeformBuy: string;
  nextBuyPrice: {
    value: string;
    dropDownValues: DropDownValue[]
  }
  totalCostOfNextBuy: string;
  slippageLimit: string
  collatAfterNextBuy: {
    value: string;
    secondaryValue: string;
  }
  outstandingDebtAfterNextBuy: {
    value: string;
    secondaryValue: string;
  }
  ethToBePurchased: string;
  estimatedTransactionCost: {
    value: string;
    dropDownValues: DropDownValue[]
  }
}

export default function BuyInfoSection({
  colRatioAfterBuy,
  multipleAfterBuy,
  ratiotoPeformBuy,
  nextBuyPrice,
  totalCostOfNextBuy,
  slippageLimit,
  collatAfterNextBuy,
  outstandingDebtAfterNextBuy,
  ethToBePurchased,
  estimatedTransactionCost
}: BuyInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <InfoSection
      title={t('basic-buy-sell.buy-title')}
      items={[
        {
          label: t('basic-buy-sell.target-col-ratio-each-buy'),
          value: `${colRatioAfterBuy}%`,
        },
        {
          label: t('basic-buy-sell.target-multiple-each-buy'),
          value: `${multipleAfterBuy}x`
        },
        {
          label: t('basic-buy-sell.trigger-col-ratio-to-perfrom-buy'),
          value: `${ratiotoPeformBuy}%`
        },
        {
          label: t('basic-buy-sell.next-buy-price'),
          value: `$${nextBuyPrice.value}`,
          dropdownValues: nextBuyPrice.dropDownValues,
        },
        {
          label: t('basic-buy-sell.setup-transaction-cost'),
          value: `$${totalCostOfNextBuy}`
        },
        {
          label: t('basic-buy-sell.slippage-limit'),
          value: `${slippageLimit}%`
        },
        {
          label: t('basic-buy-sell.collateral-after-next-buy'),
          value: collatAfterNextBuy.value,
          secondaryValue: `${collatAfterNextBuy.secondaryValue} ETH`
        },
        {
          label: t('basic-buy-sell.outstanding-debt-after-next-buy'),
          value: outstandingDebtAfterNextBuy.value,
          secondaryValue: `${outstandingDebtAfterNextBuy.secondaryValue} DAI`
        },
        {
          label: t('basic-buy-sell.eth-to-be-purchased'),
          value: `${ethToBePurchased} ETH`
        },
        {
          label: t('basic-buy-sell.estimated-transaction-cost'),
          value: `$${estimatedTransactionCost.value}`,
          dropdownValues: estimatedTransactionCost.dropDownValues,
        },
      ]}
    />
  )
}