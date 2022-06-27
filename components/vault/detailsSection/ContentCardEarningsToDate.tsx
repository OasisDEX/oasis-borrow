import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

import { zero } from '../../../helpers/zero'

interface ContentCardEarningsToDateProps {
  earningsToDate?: BigNumber
  earningsToDateAfterFees?: BigNumber
}

export function ContentCardEarningsToDate({
  earningsToDate,
  earningsToDateAfterFees,
}: ContentCardEarningsToDateProps) {
  const { t } = useTranslation()

  const formatted = {
    earningsToDate: `$${formatAmount(earningsToDate || zero, 'USD')}`,
    earningsToDateAfterFees: `$${formatAmount(earningsToDateAfterFees || zero, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-earn-vault.earnings-to-date'),
    value: formatted.earningsToDate,
    footnote: t('manage-earn-vault.earnings-to-date-after-fees', {
      afterFees: formatted.earningsToDateAfterFees,
      symbol: '',
    }),
    modal: t('manage-earn-vault.earnings-to-date-modal'),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
