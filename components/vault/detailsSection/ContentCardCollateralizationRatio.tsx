import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardCollateralizationRatioModalProps {
  collateralizationRatioFormatted: string
  collateralizationRatioAtNextPriceFormated?: string
}
interface ContentCardCollateralizationRatioProps {
  collateralizationRatio: BigNumber
  collateralizationRatioAtNextPrice?: BigNumber
  afterCollateralizationRatio?: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardCollateralizationRatioModal({
  collateralizationRatioFormatted,
  collateralizationRatioAtNextPriceFormated,
}: ContentCardCollateralizationRatioModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('system.collateralization-ratio')}</Heading>
      <Text as="p" variant="subheader" sx={{ fontSize: 2, mb: 2 }}>
        {t('manage-vault.card.collateralization-ratio-calculated')}
      </Text>
      <Heading variant="header3">{t('manage-vault.card.collateralization-ratio-header2')}</Heading>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {collateralizationRatioFormatted}
      </Card>
      <Text variant="subheader" sx={{ fontSize: 2 }}>
        {t('manage-vault.card.collateralization-ratio-description')}
      </Text>
      {collateralizationRatioAtNextPriceFormated && (
        <>
          <Heading variant="header3" sx={{ mt: 2 }}>
            {t('manage-vault.card.collateralization-ratio-next-price')}
          </Heading>
          <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
            {collateralizationRatioAtNextPriceFormated}
          </Card>
        </>
      )}
    </Grid>
  )
}

export function ContentCardCollateralizationRatio({
  collateralizationRatio,
  collateralizationRatioAtNextPrice,
  afterCollateralizationRatio,
  changeVariant,
}: ContentCardCollateralizationRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    collateralizationRatio: formatPercent(collateralizationRatio.times(100), {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    }),
    collateralizationRatioAtNextPrice:
      collateralizationRatioAtNextPrice &&
      formatPercent(collateralizationRatioAtNextPrice.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterCollateralizationRatio:
      afterCollateralizationRatio &&
      formatPercent(afterCollateralizationRatio.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardModalSettings: ContentCardCollateralizationRatioModalProps = {
    collateralizationRatioFormatted: formatted.collateralizationRatio,
  }

  if (collateralizationRatioAtNextPrice)
    contentCardModalSettings.collateralizationRatioAtNextPriceFormated =
      formatted.collateralizationRatioAtNextPrice

  const contentCardSettings: ContentCardProps = {
    title: t('system.collateralization-ratio'),
    value: formatted.collateralizationRatio,
    modal: <ContentCardCollateralizationRatioModal {...contentCardModalSettings} />,
  }

  if (afterCollateralizationRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterCollateralizationRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (collateralizationRatioAtNextPrice)
    contentCardSettings.footnote = t('system.cards.collateralization-ratio.footnote', {
      amount: formatted.collateralizationRatioAtNextPrice,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
