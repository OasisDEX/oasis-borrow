import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTriggerColRatioToBuyProps {
  token: string
  triggerColRatio?: BigNumber
  afterTriggerColRatio?: BigNumber
  nextBuyPrice?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTriggerColRatioToBuy({
  token,
  triggerColRatio,
  afterTriggerColRatio,
  nextBuyPrice,
  changeVariant,
}: ContentCardTriggerColRatioToBuyProps) {
  const { t } = useTranslation()

  const formatted = {
    triggerColRatio:
      triggerColRatio &&
      formatPercent(triggerColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterTriggerColRatio:
      afterTriggerColRatio &&
      formatPercent(afterTriggerColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    nextBuyPrice: nextBuyPrice && `$${formatAmount(nextBuyPrice, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-buy.trigger-col-ratio-to-buy-token', { token }),
    value: formatted.triggerColRatio,
  }

  if (afterTriggerColRatio && !triggerColRatio?.isEqualTo(afterTriggerColRatio) && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (nextBuyPrice)
    contentCardSettings.footnote = t('auto-buy.next-buy-price', { amount: formatted.nextBuyPrice })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
