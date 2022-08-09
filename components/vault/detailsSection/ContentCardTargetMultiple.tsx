import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTargetMultipleProps {
  targetMultiple?: BigNumber
  targetColRatio?: BigNumber
  afterTargetMultiple?: number
  changeVariant?: ChangeVariantType
}

export function ContentCardTargetMultiple({
  targetMultiple,
  targetColRatio,
  afterTargetMultiple,
  changeVariant,
}: ContentCardTargetMultipleProps) {
  const { t } = useTranslation()

  const formatted = {
    targetMultiple: `${targetMultiple?.toFixed(2)}x`,
    afterTargetMultiple: `${afterTargetMultiple?.toFixed(2)}x`,
    targetColRatio:
      targetColRatio &&
      formatPercent(targetColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('constant-multiple.target-multiple'),
  }

  if (targetMultiple) contentCardSettings.value = formatted.targetMultiple
  if (afterTargetMultiple && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTargetMultiple} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (targetColRatio)
    contentCardSettings.footnote = t('constant-multiple.target-col-ratio', {
      amount: formatted.targetColRatio,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
