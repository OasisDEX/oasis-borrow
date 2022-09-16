import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTriggerColRatioProps {
  triggerColRatio?: BigNumber
  afterTriggerColRatio?: BigNumber
  currentColRatio: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTriggerColRatio({
  triggerColRatio,
  afterTriggerColRatio,
  currentColRatio,
  changeVariant,
}: ContentCardTriggerColRatioProps) {
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
    currentColRatio: formatPercent(currentColRatio, {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-take-profit.trigger-col-ratio'),
  }

  if (triggerColRatio) contentCardSettings.value = formatted.triggerColRatio
  if (afterTriggerColRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  contentCardSettings.footnote = t('auto-take-profit.current-col-ratio', {
    amount: formatted.currentColRatio,
  })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
