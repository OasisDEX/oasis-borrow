import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTargetColRatioProps {
  targetColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
  threshold?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTargetColRatio({
  targetColRatio,
  afterTargetColRatio,
  threshold,
  changeVariant,
}: ContentCardTargetColRatioProps) {
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
    title: t('auto-buy.target-col-ratio-after-buying'),
    value: formatted.targetColRatio,
  }

  if (afterTargetColRatio && !targetColRatio?.isEqualTo(afterTargetColRatio) && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTargetColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (threshold)
    contentCardSettings.footnote = t('auto-buy.continual-buy-threshold', {
      amount: formatted.threshold,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
