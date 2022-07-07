import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTargetSellColRatioProps {
  token: string
  targetColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
  threshold?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTargetSellColRatio({
  token,
  targetColRatio,
  afterTargetColRatio,
  threshold,
  changeVariant,
}: ContentCardTargetSellColRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    targetColRatio:
      targetColRatio &&
      formatPercent(targetColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterTargetColRatio:
      afterTargetColRatio &&
      formatPercent(afterTargetColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    threshold: threshold && `$${formatAmount(threshold, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-sell.target-col-ratio-after-selling'),
    value: formatted.targetColRatio,
  }

  if (afterTargetColRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTargetColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (threshold)
    contentCardSettings.footnote = t('auto-sell.continual-sell-threshold', {
      amount: formatted.threshold,
      token,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
