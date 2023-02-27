import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { timeAgo } from 'utils'

interface ContentFooterItemsEarnOpenProps {
  estimatedBreakEven: Date
  totalValueLocked: BigNumber
  apy: BigNumber
}

export function ContentFooterItemsEarnOpen({
  estimatedBreakEven,
  totalValueLocked,
  apy,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    estimatedBreakEven: timeAgo({ to: estimatedBreakEven }),
    totalValueLocked: totalValueLocked ? `$${formatCryptoBalance(totalValueLocked)}` : '-',
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
