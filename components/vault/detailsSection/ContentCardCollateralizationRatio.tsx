import BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardCollateralizationRatioModalProps {
  positionRatioFormatted: string
  nextPositionRatioFormated?: string
}
interface ContentCardCollateralizationRatioProps {
  positionRatio: BigNumber
  nextPositionRatio?: BigNumber
  afterPositionRatio?: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardCollateralizationRatioModal({
  positionRatioFormatted,
  nextPositionRatioFormated,
}: ContentCardCollateralizationRatioModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('system.collateralization-ratio')}</Heading>
      <Text as="p" variant="paragraph2" sx={{ mb: 2 }}>
        {t('manage-vault.card.collateralization-ratio-calculated')}
      </Text>
      <Heading variant="header3">{t('manage-vault.card.collateralization-ratio-header2')}</Heading>
      <Card variant="vaultDetailsCardModal" sx={{ my: 2 }}>
        {positionRatioFormatted}
      </Card>
      <Text variant="paragraph2">{t('manage-vault.card.collateralization-ratio-description')}</Text>
      {nextPositionRatioFormated && (
        <>
          <Heading variant="header3" sx={{ mt: 2 }}>
            {t('manage-vault.card.collateralization-ratio-next-price')}
          </Heading>
          <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
            {nextPositionRatioFormated}
          </Card>
        </>
      )}
    </Grid>
  )
}

export function ContentCardCollateralizationRatio({
  positionRatio,
  nextPositionRatio,
  afterPositionRatio,
  changeVariant,
}: ContentCardCollateralizationRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    positionRatio: formatPercent(positionRatio.times(100), {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    }),
    nextPositionRatio:
      nextPositionRatio &&
      formatPercent(nextPositionRatio.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterPostionRatio:
      afterPositionRatio &&
      formatPercent(afterPositionRatio.times(100), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardModalSettings: ContentCardCollateralizationRatioModalProps = {
    positionRatioFormatted: formatted.positionRatio,
  }

  if (nextPositionRatio)
    contentCardModalSettings.nextPositionRatioFormated = formatted.nextPositionRatio

  const contentCardSettings: ContentCardProps = {
    title: t('system.collateralization-ratio'),
    value: formatted.positionRatio,
    modal: <ContentCardCollateralizationRatioModal {...contentCardModalSettings} />,
  }

  if (afterPositionRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterPostionRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (nextPositionRatio)
    contentCardSettings.footnote = t('system.cards.collateralization-ratio.footnote', {
      amount: formatted.nextPositionRatio,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
