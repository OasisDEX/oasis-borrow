import BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentFooterItemsEarnSimulateProps {
  token: string
  breakeven: BigNumber
  breakevenAnnotation?: string
  entryFees: BigNumber
  apy: BigNumber
}

export function ContentFooterItemsEarnSimulate({
  token,
  breakeven,
  breakevenAnnotation,
  entryFees,
  apy,
}: ContentFooterItemsEarnSimulateProps) {
  const { t } = useTranslation()

  const formatted = {
    breakeven: breakeven.gt(zero) ? breakeven.toFixed(0, BigNumber.ROUND_UP) : '1',
    entryFees: entryFees.gt(zero) ? `${formatCryptoBalance(entryFees)} ${token}` : '-',
    apy: formatPercent(apy, { precision: 2 }),
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('system.est-break-even')}
        value={`${t('system.est-break-even-value', { days: formatted.breakeven })}${
          breakevenAnnotation ? ` (${breakevenAnnotation})` : ''
        }`}
      />
      <DetailsSectionFooterItem title={t('system.est-entry-fees')} value={formatted.entryFees} />
      <DetailsSectionFooterItem title={t('system.apy')} value={formatted.apy} />
    </>
  )
}
