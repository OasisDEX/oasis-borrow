import BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

function ContentCardOperatingCostModal() {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('constant-multiple.operating-cost')}</Heading>
      <Text variant="paragraph2">{t('constant-multiple.operating-cost-desc')}</Text>
    </Grid>
  )
}

interface ContentCardOperatingCostProps {
  totalCost?: BigNumber
  PnLSinceEnabled?: BigNumber
}

export function ContentCardOperatingCost({
  totalCost,
  PnLSinceEnabled,
}: ContentCardOperatingCostProps) {
  const { t } = useTranslation()

  const formatted = {
    totalCost: totalCost && `$${formatAmount(totalCost, 'USD')}`,
    PnLSinceEnabled:
      PnLSinceEnabled &&
      formatPercent(PnLSinceEnabled.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('constant-multiple.operating-cost'),
    modal: <ContentCardOperatingCostModal />,
  }

  if (totalCost) contentCardSettings.value = formatted.totalCost
  if (PnLSinceEnabled)
    contentCardSettings.footnote = t('constant-multiple.pnl-since-enabled', {
      amount: formatted.PnLSinceEnabled,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
