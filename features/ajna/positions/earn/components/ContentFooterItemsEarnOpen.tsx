import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnOpenProps {
  totalValueLocked?: BigNumber
  days: number
  apy?: BigNumber
}

export function ContentFooterItemsEarnOpen({
  totalValueLocked,
  apy,
  days,
}: ContentFooterItemsEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    totalValueLocked: totalValueLocked ? `$${formatCryptoBalance(totalValueLocked)}` : '-',
    apy: apy ? `${formatDecimalAsPercent(apy)}` : '-',
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('total-value-locked')}
        value={formatted.totalValueLocked}
      />
      <DetailsSectionFooterItem title={t('average-apy-in-days', { days })} value={formatted.apy} />
    </>
  )
}
