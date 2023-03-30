import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatCryptoBalance, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardCurrentEarningsModalProps {
  earnings: string
  quoteToken: string
}

function ContentCardCurrentEarningsModal({
  earnings,
  quoteToken,
}: ContentCardCurrentEarningsModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">
        {t('ajna.position-page.earn.manage.overview.current-earnings')}
      </Heading>
      <Text variant="paragraph2" as="p" sx={{ pb: 2 }}>
        {t('ajna.position-page.earn.manage.overview.current-earnings-modal-desc', { quoteToken })}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {earnings} {quoteToken}
      </Card>
    </Grid>
  )
}

interface ContentCardCurrentEarningsProps {
  isLoading?: boolean
  quoteToken: string
  currentEarnings: BigNumber
  afterCurrentEarnings?: BigNumber
  netPnL: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardCurrentEarnings({
  isLoading,
  quoteToken,
  currentEarnings,
  afterCurrentEarnings,
  netPnL,
  changeVariant = 'positive',
}: ContentCardCurrentEarningsProps) {
  const { t } = useTranslation()

  const formatted = {
    currentEarnings: formatCryptoBalance(currentEarnings),
    afterCurrentEarnings:
      afterCurrentEarnings && `${formatCryptoBalance(afterCurrentEarnings)} ${quoteToken}`,
    netPnL: formatPercent(netPnL, { precision: 2 }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.earn.manage.overview.current-earnings'),
    value: formatted.currentEarnings,
    unit: quoteToken,
    change: {
      isLoading,
      value:
        afterCurrentEarnings &&
        `${formatted.afterCurrentEarnings} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <ContentCardCurrentEarningsModal
        earnings={formatted.currentEarnings}
        quoteToken={quoteToken}
      />
    ),
  }

  if (!netPnL.isZero()) {
    contentCardSettings.footnote = t('ajna.position-page.earn.manage.overview.net-pnl', {
      netPnL: formatted.netPnL,
    })
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
