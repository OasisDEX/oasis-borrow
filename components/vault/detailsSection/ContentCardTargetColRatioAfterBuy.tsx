import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { maxUint256 } from 'features/automation/common/consts'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTargetColRatioAfterBuyProps {
  targetColRatio?: BigNumber
  afterTargetColRatio?: BigNumber
  threshold?: BigNumber
  changeVariant?: ChangeVariantType
  token: string
}

export function ContentCardTargetColRatioAfterBuy({
  targetColRatio,
  afterTargetColRatio,
  threshold,
  changeVariant,
  token,
}: ContentCardTargetColRatioAfterBuyProps) {
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
    threshold: !threshold
      ? undefined
      : threshold.isEqualTo(maxUint256)
      ? t('unlimited')
      : `$${formatAmount(threshold, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-buy.target-col-ratio-after-buying'),
    value: formatted.targetColRatio,
  }

  if (afterTargetColRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTargetColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  if (threshold)
    contentCardSettings.footnote = t('auto-buy.continual-buy-threshold', {
      amount: formatted.threshold,
      token,
    })

  if (threshold?.isEqualTo(maxUint256) || threshold?.isZero())
    contentCardSettings.footnote = t('auto-buy.continual-buy-no-threshold')

  return <DetailsSectionContentCard {...contentCardSettings} />
}
