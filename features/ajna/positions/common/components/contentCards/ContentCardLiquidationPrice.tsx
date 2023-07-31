import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { AjnaDetailsSectionContentSimpleModal } from 'features/ajna/common/components/AjnaDetailsSectionContentSimpleModal'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface ContentCardLiquidationPriceProps {
  isLoading?: boolean
  priceFormat: string
  liquidationPrice: BigNumber
  afterLiquidationPrice?: BigNumber
  belowCurrentPrice: BigNumber
  isOracless?: boolean
  changeVariant?: ChangeVariantType
}

export function ContentCardLiquidationPrice({
  isLoading,
  priceFormat,
  liquidationPrice,
  afterLiquidationPrice,
  belowCurrentPrice,
  isOracless,
  changeVariant = 'positive',
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    liquidationPrice: formatCryptoBalance(liquidationPrice),
    afterLiquidationPrice: afterLiquidationPrice && formatCryptoBalance(afterLiquidationPrice),
    belowCurrentPrice: formatDecimalAsPercent(belowCurrentPrice.abs()),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.liquidation-price'),
    value: `${formatted.liquidationPrice}`,
    unit: `${priceFormat}`,
    change: {
      isLoading,
      value:
        afterLiquidationPrice &&
        `${formatted.afterLiquidationPrice} ${priceFormat} ${t('system.cards.common.after')}`,
      variant: changeVariant,
    },
    modal: (
      <AjnaDetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.liquidation-price')}
        description={t('ajna.position-page.borrow.common.overview.liquidation-price-modal-desc')}
        value={`${formatted.liquidationPrice} ${priceFormat}`}
      />
    ),
  }

  if (!isOracless || !liquidationPrice.isZero()) {
    contentCardSettings.footnote = t(
      `ajna.position-page.borrow.common.overview.${
        belowCurrentPrice.gt(zero) ? 'below' : 'above'
      }-current-price`,
      {
        priceRatio: formatted.belowCurrentPrice,
      },
    )
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
