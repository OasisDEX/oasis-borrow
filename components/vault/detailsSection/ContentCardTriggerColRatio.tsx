import BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

interface ContentCardTriggerColRatioProps {
  triggerColRatio?: BigNumber
  afterTriggerColRatio?: BigNumber
  currentColRatio: BigNumber
  changeVariant?: ChangeVariantType
}

function ContentCardTriggerColRatioModal() {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('auto-take-profit.trigger-col-ratio')}</Heading>
      <Text as="p" variant="paragraph2">
        {t('auto-take-profit.trigger-col-ratio-explanation')}
      </Text>
    </Grid>
  )
}

export function ContentCardTriggerColRatio({
  triggerColRatio,
  afterTriggerColRatio,
  currentColRatio,
  changeVariant,
}: ContentCardTriggerColRatioProps) {
  const { t } = useTranslation()

  const formatted = {
    triggerColRatio:
      triggerColRatio &&
      formatPercent(triggerColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    afterTriggerColRatio:
      afterTriggerColRatio &&
      formatPercent(afterTriggerColRatio, {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
    currentColRatio: formatPercent(currentColRatio, {
      precision: 2,
      roundMode: BigNumber.ROUND_DOWN,
    }),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-take-profit.trigger-col-ratio'),
    modal: <ContentCardTriggerColRatioModal />,
  }

  if (triggerColRatio) contentCardSettings.value = formatted.triggerColRatio
  if (afterTriggerColRatio && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColRatio} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  contentCardSettings.footnote = t('auto-take-profit.current-col-ratio', {
    amount: formatted.currentColRatio,
  })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
