import type BigNumber from 'bignumber.js'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'
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
  customUnit?: string
  customUnitToken?: string
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
  customUnit,
  customUnitToken,
}: ContentCardDynamicStopPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    dynamicStopPrice: `${!customUnit ? '$' : ''}${formatAmount(
      dynamicStopLossPrice,
      customUnitToken ?? 'USD',
    )}`,
    aboveLiquidationPrice: formatAmount(dynamicStopLossPrice.minus(liquidationPrice), 'USD'),
    afterDynamicStopPrice: `${!customUnit ? '$' : ''}${formatAmount(
      afterDynamicStopLossPrice,
      customUnitToken ?? 'USD',
    )}${customUnit ? ` ${customUnit}` : ''}`,
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
  if (isEditing) {
    contentCardSettings.change = {
      value: `${formatted.afterDynamicStopPrice} ${t('system.cards.common.after')}`,
      variant: 'positive',
    }
  }
  if (customUnit) {
    contentCardSettings.unit = customUnit
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
