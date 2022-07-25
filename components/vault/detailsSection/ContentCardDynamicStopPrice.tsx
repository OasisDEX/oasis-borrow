import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
import { Card, Grid, Heading, Text } from 'theme-ui'

export interface ContentCardDynamicStopPriceModalProps {
  dynamicStopPrice: BigNumber
  dynamicStopPriceFormatted: string
}

interface ContentCardDynamicStopPriceProps {
  isStopLossEnabled: boolean
  isEditing: boolean
  slRatio: BigNumber
  liquidationPrice: BigNumber
  liquidationRatio: BigNumber
  afterSlRatio: BigNumber
}

export function ContentCardDynamicStopPriceModal({
  dynamicStopPrice,
  dynamicStopPriceFormatted,
}: ContentCardDynamicStopPriceModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-multiply-vault.card.dynamic-stop-loss-price')}</Heading>
      <Text as="p" variant="subheader" sx={{ fontSize: 2, mt: 2 }}>
        {t('manage-multiply-vault.card.dynamic-stop-loss-price-desc')}
      </Text>
      <Text as="p" variant="header4" sx={{ mt: 3, fontWeight: 'semiBold' }}>
        {t('manage-multiply-vault.card.current-dynamic-stop-loss-price')}
      </Text>
      <Card variant="vaultDetailsCardModal" sx={{ mt: 2 }}>
        <Heading variant="header3">
          {!dynamicStopPrice.isZero() ? dynamicStopPriceFormatted : '-'}
        </Heading>
      </Card>
    </Grid>
  )
}

export function ContentCardDynamicStopPrice({
  isStopLossEnabled,
  isEditing,
  slRatio,
  liquidationPrice,
  liquidationRatio,
  afterSlRatio,
}: ContentCardDynamicStopPriceProps) {
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slRatio)

  const formatted = {
    dynamicStopPrice: `$${formatAmount(dynamicStopPrice, 'USD')}`,
    aboveLiquidationPrice: formatAmount(dynamicStopPrice.minus(liquidationPrice), 'USD'),
    afterDynamicStopPrice: `$${formatAmount(
      liquidationPrice.div(liquidationRatio).times(afterSlRatio),
      'USD',
    )}`,
  }

  const contentCardModalSettings: ContentCardDynamicStopPriceModalProps = {
    dynamicStopPrice,
    dynamicStopPriceFormatted: formatted.dynamicStopPrice,
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-multiply-vault.card.dynamic-stop-price'),
    modal: <ContentCardDynamicStopPriceModal {...contentCardModalSettings} />,
  }

  if (isStopLossEnabled) {
    contentCardSettings.value = formatted.dynamicStopPrice
    contentCardSettings.footnote = `${formatted.aboveLiquidationPrice} ${t(
      'manage-multiply-vault.card.above-liquidation-price',
    )}`
  }
  if (isEditing)
    contentCardSettings.change = {
      value: `${formatted.afterDynamicStopPrice} ${t('system.cards.common.after')}`,
      variant: 'positive',
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
