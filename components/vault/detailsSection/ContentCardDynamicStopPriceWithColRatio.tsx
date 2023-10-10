import type BigNumber from 'bignumber.js'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import type { ContentCardDynamicStopPriceModalProps } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import { ContentCardDynamicStopPriceModal } from 'components/vault/detailsSection/ContentCardDynamicStopPrice'
import type { StopLossTriggerData } from 'features/automation/protection/stopLoss/state/stopLossTriggerData.types'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardDynamicStopPriceWithColRatioProps {
  slData: StopLossTriggerData
  liquidationPrice: BigNumber
  afterLiquidationPrice?: BigNumber
  liquidationRatio: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardDynamicStopPriceWithColRatio({
  slData,
  liquidationPrice,
  afterLiquidationPrice,
  liquidationRatio,
  changeVariant,
}: ContentCardDynamicStopPriceWithColRatioProps) {
  const { t } = useTranslation()

  const dynamicStopPrice = liquidationPrice.div(liquidationRatio).times(slData.stopLossLevel)
  const afterDynamicStopPrice =
    afterLiquidationPrice && afterLiquidationPrice.div(liquidationRatio).times(slData.stopLossLevel)

  const formatted = {
    dynamicStopPrice: `$${formatAmount(dynamicStopPrice, 'USD')}`,
    afterDynamicStopPrice:
      afterDynamicStopPrice && `$${formatAmount(afterDynamicStopPrice, 'USD')}`,
    stopLossLevel: formatPercent(slData.stopLossLevel.times(100), { precision: 2 }),
  }

  const contentCardModalSettings: ContentCardDynamicStopPriceModalProps = {
    dynamicStopPrice,
    dynamicStopPriceFormatted: formatted.dynamicStopPrice,
    ratioParamTranslationKey: 'system.collateral-ratio',
  }

  const contentCardSettings: ContentCardProps = {
    title: t('manage-multiply-vault.card.dynamic-stop-price'),
    value: formatted.dynamicStopPrice,
    footnote: t('system.cards.dynamic-stop-price.footnote', {
      amount: formatted.stopLossLevel,
    }),
    modal: <ContentCardDynamicStopPriceModal {...contentCardModalSettings} />,
  }

  if (afterDynamicStopPrice && changeVariant)
    contentCardSettings.change = {
      value: `${formatted.afterDynamicStopPrice} ${t('system.cards.common.after')}`,
      variant: 'positive',
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
