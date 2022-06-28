import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnProps {
  token: string
  breakeven: BigNumber
  entryFees: BigNumber
  apy: BigNumber
}

export function ContentFooterItemsEarn({
  token,
  breakeven,
  entryFees,
  apy,
}: ContentFooterItemsEarnProps) {
  const { t } = useTranslation()

  const formatted = {
    breakeven: breakeven.gt(zero) ? breakeven.toFixed(2) : '-',
    entryFees: entryFees.gt(zero) ? `${entryFees.toFixed(2)} ${token}` : '-',
    apy: apy.toFixed(2),
  }

  return (
    <>
      <DetailsSectionFooterItem title={t('system.est-break-even')} value={formatted.breakeven} />
      <DetailsSectionFooterItem title={t('system.est-entry-fees')} value={formatted.entryFees} />
      <DetailsSectionFooterItem title={t('system.apy')} value={`${formatted.apy}%`} />
    </>
  )
}
