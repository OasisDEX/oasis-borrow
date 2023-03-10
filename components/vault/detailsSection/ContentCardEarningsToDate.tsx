import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

import { zero } from '../../../helpers/zero'

interface ContentCardEarningsToDateProps {
  earningsToDate?: BigNumber
  earningsToDateAfterFees?: BigNumber
}

function ContentCardEarningsToDateModal() {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-earn-vault.earnings-to-date')}</Heading>
      <Text variant="paragraph2">{t('manage-earn-vault.earnings-to-date-modal')}</Text>
    </Grid>
  )
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
    modal: <ContentCardEarningsToDateModal />,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
