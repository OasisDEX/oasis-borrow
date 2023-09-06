import React from 'react'
import BigNumber from 'bignumber.js'
import { ContentCardProps, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import { Card, Grid, Heading, Text } from 'theme-ui'

export interface ContentCardDynamicStopPriceModalProps {
  dynamicStopPrice: BigNumber
  dynamicStopPriceFormatted: string
  ratioParamTranslationKey: string
}

interface ContentCardDynamicStopPriceProps {
  isStopLossEnabled: boolean
  isEditing: boolean
  liquidationPrice: BigNumber
  dynamicStopLossPrice: BigNumber
  afterDynamicStopLossPrice: BigNumber
  ratioParamTranslationKey: string
}

export function ContentCardDynamicStopPriceModal({
  dynamicStopPrice,
  dynamicStopPriceFormatted,
  ratioParamTranslationKey,
}: ContentCardDynamicStopPriceModalProps) {
  const { t } = useTranslation()

  return (
    <Grid gap={2}>
      <Heading variant="header3">{t('manage-multiply-vault.card.dynamic-stop-loss-price')}</Heading>
      <Text as="p" variant="paragraph2" sx={{ mt: 2 }}>
        {t('manage-multiply-vault.card.dynamic-stop-loss-price-desc', {
          ratioParam: t(ratioParamTranslationKey),
        })}
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
  liquidationPrice,
  ratioParamTranslationKey,
  dynamicStopLossPrice,
  afterDynamicStopLossPrice,
}: ContentCardDynamicStopPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    dynamicStopPrice: `$${formatAmount(dynamicStopLossPrice, 'USD')}`,
    aboveLiquidationPrice: formatAmount(dynamicStopLossPrice.minus(liquidationPrice), 'USD'),
    afterDynamicStopPrice: `$${formatAmount(afterDynamicStopLossPrice, 'USD')}`,
  }

  const contentCardModalSettings: ContentCardDynamicStopPriceModalProps = {
    dynamicStopPrice: dynamicStopLossPrice,
    dynamicStopPriceFormatted: formatted.dynamicStopPrice,
    ratioParamTranslationKey,
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
