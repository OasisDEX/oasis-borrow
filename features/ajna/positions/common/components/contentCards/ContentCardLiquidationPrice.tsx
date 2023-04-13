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
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  liquidationPrice: BigNumber
  afterLiquidationPrice?: BigNumber
  belowCurrentPrice: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentCardLiquidationPrice({
  isLoading,
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
    afterLiquidationPrice: afterLiquidationPrice && formatCryptoBalance(afterLiquidationPrice),
    belowCurrentPrice: formatDecimalAsPercent(belowCurrentPrice),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.liquidation-price'),
    value: `${formatted.liquidationPrice}`,
    unit: `${collateralToken}/${quoteToken}`,
    change: {
      isLoading,
      value:
        afterLiquidationPrice &&
        `${formatted.afterLiquidationPrice} ${collateralToken}/${quoteToken} ${t(
          'system.cards.common.after',
        )}`,
      variant: changeVariant,
    },
  }

  if (!liquidationPrice.isZero()) {
    contentCardSettings.footnote = t(
      'ajna.position-page.borrow.common.overview.below-current-price',
      {
        belowCurrentPrice: formatted.belowCurrentPrice,
      },
    )
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
