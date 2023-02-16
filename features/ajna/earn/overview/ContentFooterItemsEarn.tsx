import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnProps {
  estimatedBreakEven?: number
  totalValueLocked?: BigNumber
  apy?: BigNumber
}

export function ContentFooterItemsEarn({
  estimatedBreakEven,
  totalValueLocked,
  apy,
}: ContentFooterItemsEarnProps) {
  const { t } = useTranslation()

  const formatted = {
    estimatedBreakEven: estimatedBreakEven ? `${estimatedBreakEven} days` : '-', // TODO years etc.
    totalValueLocked: totalValueLocked ? `$${formatAmount(totalValueLocked, 'USD')}` : '-',
    apy: apy ? `${formatPercent(apy, { precision: 2 })}` : '-',
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
      <DetailsSectionFooterItem title={t('position-apy')} value={formatted.apy} />
    </>
  )
}
