import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTotalCostOfFeatureProps {
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
  afterTotalCost?: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardTotalCostOfFeature({
  totalCost,
  PnLSinceEnabled,
  afterTotalCost,
  changeVariant,
}: ContentCardTotalCostOfFeatureProps) {
  const { t } = useTranslation()

  const formatted = {
    totalCost: totalCost && `$${formatAmount(totalCost, 'USD')}`,
    afterTotalCost: afterTotalCost && `$${formatAmount(afterTotalCost, 'USD')}`,
    PnLSinceEnabled:
      PnLSinceEnabled &&
      formatPercent(PnLSinceEnabled.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('constant-multiple.total-cost-of-feature'),
  }

  if (totalCost) contentCardSettings.value = formatted.totalCost
  if (afterTotalCost && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTotalCost} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (PnLSinceEnabled)
    contentCardSettings.footnote = t('constant-multiple.pnl-since-enabled', {
      amount: formatted.PnLSinceEnabled,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
