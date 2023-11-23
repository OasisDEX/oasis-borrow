import type BigNumber from 'bignumber.js'
import { DetailsSectionFooterItem } from 'components/DetailsSectionFooterItem'
import {
  formatCryptoBalance,
  formatDecimalAsPercent,
  formatFiatBalance,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaContentFooterEarnOpenProps {
  apy?: BigNumber
  days: number
  isOracless: boolean
  quoteToken: string
  totalValueLocked?: BigNumber
  totalValueLockedUsd?: BigNumber
}

export function AjnaContentFooterEarnOpen({
  apy,
  days,
  isOracless,
  quoteToken,
  totalValueLocked,
  totalValueLockedUsd,
}: AjnaContentFooterEarnOpenProps) {
  const { t } = useTranslation()

  const formatted = {
    totalValueLocked: totalValueLocked
      ? `${formatCryptoBalance(totalValueLocked)} ${quoteToken}`
      : '-',
    totalValueLockedUsd: totalValueLockedUsd ? `$${formatFiatBalance(totalValueLockedUsd)}` : '-',
    apy: apy ? `${formatDecimalAsPercent(apy)}` : '-',
  }

  return (
    <>
      <DetailsSectionFooterItem
        title={t('total-value-locked')}
        value={isOracless ? formatted.totalValueLocked : formatted.totalValueLockedUsd}
      />
      <DetailsSectionFooterItem title={t('average-apy-in-days', { days })} value={formatted.apy} />
    </>
  )
}
