import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { timeAgo } from 'utils'

interface ContentFooterItemsEarnOpenProps {
  estimatedBreakEven?: Date
  totalValueLocked?: BigNumber
  days: number
  apy?: BigNumber
}

export function ContentFooterItemsEarnOpen({
  estimatedBreakEven,
  totalValueLocked,
  apy,
  days,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    estimatedBreakEven: estimatedBreakEven ? timeAgo({ to: estimatedBreakEven }) : '-',
    totalValueLocked: totalValueLocked ? `$${formatCryptoBalance(totalValueLocked)}` : '-',
    apy: apy ? `${formatDecimalAsPercent(apy)}` : '-',
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.est-break-even')}
        value={formatted.estimatedBreakEven}
      />
      <DetailsSectionFooterItem
        title={t('total-value-locked')}
        value={formatted.totalValueLocked}
      />
      <DetailsSectionFooterItem title={t('average-apy-in-days', { days })} value={formatted.apy} />
    </>
  )
}
