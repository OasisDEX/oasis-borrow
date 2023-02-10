import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLiquidationPriceProps {
  collateralToken: string
  quoteToken: string
  liquidationPrice: BigNumber
  afterLiquidationPrice?: BigNumber
  belowCurrentPrice: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLiquidationPrice({
  collateralToken,
  quoteToken,
  liquidationPrice,
  afterLiquidationPrice,
  belowCurrentPrice,
  changeVariant = 'positive',
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    liquidationPrice: formatCryptoBalance(liquidationPrice),
    afterLiquidationPrice: afterLiquidationPrice && formatCryptoBalance(liquidationPrice),
    belowCurrentPrice: formatDecimalAsPercent(belowCurrentPrice),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.borrow.common.overview.liquidation-price'),
    value: `${formatted.liquidationPrice}`,
    unit: `${collateralToken}/${quoteToken}`,
  }

  if (!liquidationPrice.isZero()) {
    contentCardSettings.footnote = t('ajna.borrow.common.overview.below-current-price', {
      belowCurrentPrice: formatted.belowCurrentPrice,
    })
  }

  if (afterLiquidationPrice !== undefined)
    contentCardSettings.change = {
      value: `${formatted.afterLiquidationPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
