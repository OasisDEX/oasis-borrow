import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTriggerColRatioToSellProps {
  token: string
  triggerColRatio?: BigNumber
  afterTriggerColRatio?: BigNumber
  nextSellPrice?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTriggerColRatioToSell({
  token,
  triggerColRatio,
  afterTriggerColRatio,
  nextSellPrice,
  changeVariant,
}: ContentCardTriggerColRatioToSellProps) {
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
    nextSellPrice: nextSellPrice && `$${formatAmount(nextSellPrice, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-sell.trigger-col-ratio-to-sell-token', { token }),
  }

  if (triggerColRatio) contentCardSettings.value = formatted.triggerColRatio
  if (afterTriggerColRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (nextSellPrice)
    contentCardSettings.footnote = t('auto-sell.next-sell-price', {
      amount: formatted.nextSellPrice,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
