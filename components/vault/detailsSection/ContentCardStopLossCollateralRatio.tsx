import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardStopLossCollateralRatioModalProps {
  isStopLossEnabled: boolean
  slRatioFormatted: string
}

interface ContentCardStopLossCollateralRatioProps {
  isStopLossEnabled: boolean
  isEditing: boolean
  slRatio: BigNumber
  collateralizationRatio: BigNumber
  afterSlRatio: BigNumber
}

function ContentCardStopLossCollateralRatioModal({
  isStopLossEnabled,
  slRatioFormatted,
}: ContentCardStopLossCollateralRatioModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-multiply-vault.card.stop-loss-coll-ratio')}</Heading>
      <Text as="p" variant="subheader" sx={{ fontSize: 2, mt: 2 }}>
        {t('manage-multiply-vault.card.stop-loss-coll-ratio-desc')}
      </Text>
      <Text as="p" variant="header4" sx={{ mt: 3, fontWeight: 'semiBold' }}>
        {t('manage-multiply-vault.card.current-stop-loss-coll-ratio')}
      </Text>
      <Card as="p" variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        <Heading variant="header3">{isStopLossEnabled ? slRatioFormatted : '-'}</Heading>
      </Card>
    </Grid>
  )
}

export function ContentCardStopLossCollateralRatio({
  isStopLossEnabled,
  isEditing,
  slRatio,
  afterSlRatio,
  collateralizationRatio,
}: ContentCardStopLossCollateralRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    slRatio: formatPercent(slRatio.times(100), {
      precision: 2,
    }),
    belowCurrentCollRatio: formatPercent(collateralizationRatio.minus(slRatio).times(100), {
      precision: 2,
    }),
    afterSlRatio: formatPercent(afterSlRatio.times(100), {
      precision: 2,
    }),
  }

  const contentCardModalSettings: ContentCardStopLossCollateralRatioModalProps = {
    isStopLossEnabled: isStopLossEnabled,
    slRatioFormatted: formatted.slRatio,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-multiply-vault.card.stop-loss-coll-ratio'),
    footnote: t('system.cards.stop-loss-collateral-ratio.footnote', {
      amount: formatted.belowCurrentCollRatio,
    }),
    modal: <ContentCardStopLossCollateralRatioModal {...contentCardModalSettings} />,
  }

  if (isStopLossEnabled) contentCardSettings.value = formatted.slRatio

  if (isEditing)
    contentCardSettings.change = {
      value: `${formatted.afterSlRatio} ${t('system.cards.common.after')}`,
      variant: 'positive',
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
