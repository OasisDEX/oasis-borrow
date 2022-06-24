import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import {
  formatAmount,
  formatCryptoBalance,
  formatFiatBalance,
  formatPercent,
} from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Box, Card, Divider, Grid, Heading, Text } from 'theme-ui'

import { getToken } from '../../../blockchain/tokensMetadata'
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
