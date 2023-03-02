import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentPositionLendingPriceProps {
  isLoading?: boolean
  collateralToken: string
  quoteToken: string
  positionLendingPrice: BigNumber
  afterPositionLendingPrice?: BigNumber
  relationToMarketPrice: BigNumber
  changeVariant?: ChangeVariantType
}

export function ContentPositionLendingPrice({
  isLoading,
  collateralToken,
  quoteToken,
  positionLendingPrice,
  afterPositionLendingPrice,
  relationToMarketPrice,
  changeVariant = 'positive',
}: ContentPositionLendingPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    positionLendingPrice: formatCryptoBalance(positionLendingPrice),
    afterPositionLendingPrice:
      afterPositionLendingPrice && formatCryptoBalance(afterPositionLendingPrice),
    relationToMarketPrice: t(
      relationToMarketPrice.gte(zero)
        ? 'ajna.earn.manage.overview.above-market-price'
        : 'ajna.earn.manage.overview.below-market-price',
      { amount: relationToMarketPrice.abs() },
    ),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.earn.manage.overview.position-lending-price'),
    value: formatted.positionLendingPrice,
    unit: `${collateralToken}/${quoteToken}`,
    change: {
      isLoading,
      value:
        afterPositionLendingPrice &&
        `${formatted.afterPositionLendingPrice} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    footnote: formatted.relationToMarketPrice,
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
