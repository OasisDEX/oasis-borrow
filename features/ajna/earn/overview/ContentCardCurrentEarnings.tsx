import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardCurrentEarningsProps {
  isLoading?: boolean
  quoteToken: string
  currentEarnings: BigNumber
  afterCurrentEarnings?: BigNumber
  netPnL: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardCurrentEarnings({
  isLoading,
  quoteToken,
  currentEarnings,
  afterCurrentEarnings,
  netPnL,
  changeVariant = 'positive',
}: ContentCardCurrentEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    currentEarnings: formatAmount(currentEarnings, quoteToken),
    afterCurrentEarnings:
      afterCurrentEarnings && `${formatAmount(afterCurrentEarnings, quoteToken)} ${quoteToken}`,
    netPnL: formatPercent(netPnL, { precision: 2 }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.earn.manage.overview.current-earnings'),
    value: formatted.currentEarnings,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterCurrentEarnings &&
        `${formatted.afterCurrentEarnings} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
  }

  if (!netPnL.isZero()) {
    contentCardSettings.footnote = t('ajna.earn.manage.overview.net-pnl', {
      netPnL: formatted.netPnL,
    })
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
