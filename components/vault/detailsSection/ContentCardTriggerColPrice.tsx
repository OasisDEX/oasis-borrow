import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Grid, Heading, Text } from 'theme-ui'

interface ContentCardTriggerColPriceProps {
  token: string
  triggerColPrice?: BigNumber
  afterTriggerColPrice?: BigNumber
  estimatedProfit?: BigNumber
  changeVariant?: ChangeVariantType
}
interface ContentCardTriggerColPriceModalProps {
  token: string
}

function ContentCardTriggerColPriceModal({ token }: ContentCardTriggerColPriceModalProps) {
  const { t } = useTranslation()
  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('auto-take-profit.trigger-col-price', { token })}</Heading>
      <Text as="p" variant="paragraph2">
        {t('auto-take-profit.trigger-col-price-explanation', { token })}
      </Text>
      <Text as="p" variant="paragraph2">
        {t('auto-take-profit.estimated-profit-explanation', { token })}
      </Text>
    </Grid>
  )
}

export function ContentCardTriggerColPrice({
  token,
  triggerColPrice,
  afterTriggerColPrice,
  estimatedProfit,
  changeVariant,
}: ContentCardTriggerColPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    triggerColPrice: triggerColPrice && `$${formatAmount(triggerColPrice, 'USD')}`,
    afterTriggerColPrice: afterTriggerColPrice && `$${formatAmount(afterTriggerColPrice, 'USD')}`,
    estimatedProfit: estimatedProfit && `$${formatAmount(estimatedProfit, 'USD')}`,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('auto-take-profit.trigger-col-price', { token }),
    modal: <ContentCardTriggerColPriceModal token={token} />,
  }

  if (triggerColPrice) contentCardSettings.value = formatted.triggerColPrice
  if (afterTriggerColPrice && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterTriggerColPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }
  if (estimatedProfit)
    contentCardSettings.footnote = t('auto-take-profit.estimated-profit', {
      amount: formatted.estimatedProfit,
    })

  return <DetailsSectionContentCard {...contentCardSettings} />
}
