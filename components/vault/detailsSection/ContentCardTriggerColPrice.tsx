import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTriggerColPriceProps {
  token: string
  triggerColPrice?: BigNumber
  afterTriggerColPrice?: BigNumber
  estimatedProfit?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTriggerColPrice({
  token,
  triggerColPrice,
  afterTriggerColPrice,
  estimatedProfit,
  changeVariant,
}: ContentCardTriggerColPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    triggerColPrice: triggerColPrice && `$${formatAmount(triggerColPrice, 'USD')}`,
    afterTriggerColPrice: afterTriggerColPrice && `$${formatAmount(afterTriggerColPrice, 'USD')}`,
    estimatedProfit: estimatedProfit && `$${formatAmount(estimatedProfit, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-take-profit.trigger-col-price', { token }),
  }

  if (triggerColPrice) contentCardSettings.value = formatted.triggerColPrice
  if (afterTriggerColPrice && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (estimatedProfit)
    contentCardSettings.footnote = t('auto-take-profit.estimated-profit', {
      amount: formatted.estimatedProfit,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
