import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardTotalCostOfFeatureProps {
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
}

export function ContentCardTotalCostOfFeature({
  totalCost,
  PnLSinceEnabled,
}: ContentCardTotalCostOfFeatureProps) {
  const { t } = useTranslation()

  const formatted = {
    totalCost: totalCost && `$${formatAmount(totalCost, 'USD')}`,
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
  if (PnLSinceEnabled)
    contentCardSettings.footnote = t('constant-multiple.pnl-since-enabled', {
      amount: formatted.PnLSinceEnabled,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
