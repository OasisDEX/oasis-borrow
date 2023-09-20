import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

interface ContentCardStopLossCollateralRatioModalProps {
  isStopLossEnabled: boolean
  stopLossLevelFormatted: string
  ratioParamTranslationKey: string
  modalDescription: string
}

interface ContentCardStopLossCollateralRatioProps {
  isStopLossEnabled: boolean
  isEditing: boolean
  stopLossLevel: BigNumber
  afterStopLossLevel: BigNumber
  ratioParamTranslationKey: string
  stopLossLevelCardFootnoteKey: string
  modalDescription: string
  belowCurrentPositionRatio: string
}

function ContentCardStopLossCollateralRatioModal({
  isStopLossEnabled,
  stopLossLevelFormatted,
  ratioParamTranslationKey,
  modalDescription,
}: ContentCardStopLossCollateralRatioModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">
        {t('protection.stop-loss-something', { value: t(ratioParamTranslationKey) })}
      </Heading>
      <Text as="p" variant="paragraph2" sx={{ mt: 2 }}>
        {t(modalDescription)}
      </Text>
      <Text as="p" variant="header4" sx={{ mt: 3, fontWeight: 'semiBold' }}>
        {t('protection.current-stop-loss-something', { value: t(ratioParamTranslationKey) })}
      </Text>
      <Card as="div" variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        <Heading variant="header3">{isStopLossEnabled ? stopLossLevelFormatted : '-'}</Heading>
      </Card>
    </Grid>
  )
}

export function ContentCardStopLossLevel({
  isStopLossEnabled,
  isEditing,
  stopLossLevel,
  afterStopLossLevel,
  ratioParamTranslationKey,
  stopLossLevelCardFootnoteKey,
  modalDescription,
  belowCurrentPositionRatio,
}: ContentCardStopLossCollateralRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    stopLossLevel: formatPercent(stopLossLevel.times(100), {
      precision: 2,
    }),
    afterStopLossLevel: formatPercent(afterStopLossLevel, {
      precision: 2,
    }),
  }

  const contentCardModalSettings: ContentCardStopLossCollateralRatioModalProps = {
    isStopLossEnabled: isStopLossEnabled,
    stopLossLevelFormatted: formatted.stopLossLevel,
    ratioParamTranslationKey,
    modalDescription,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('protection.stop-loss-something', { value: t(ratioParamTranslationKey) }),
    modal: <ContentCardStopLossCollateralRatioModal {...contentCardModalSettings} />,
  }

  if (isStopLossEnabled) {
    contentCardSettings.value = formatted.stopLossLevel
    contentCardSettings.footnote = t(stopLossLevelCardFootnoteKey, {
      amount: belowCurrentPositionRatio,
      value: t(ratioParamTranslationKey),
    })
  }

  if (isEditing)
    contentCardSettings.change = {
      value: `${formatted.afterStopLossLevel} ${t('system.cards.common.after')}`,
      variant: 'positive',
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
