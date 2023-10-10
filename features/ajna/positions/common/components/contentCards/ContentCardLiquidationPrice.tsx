import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ChangeVariantType, ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
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
  belowCurrentPrice?: BigNumber
  withTooltips?: boolean
  changeVariant?: ChangeVariantType
}

export function ContentCardLiquidationPrice({
  isLoading,
  priceFormat,
  liquidationPrice,
  afterLiquidationPrice,
  belowCurrentPrice,
  withTooltips,
  changeVariant = 'positive',
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    liquidationPrice: formatCryptoBalance(liquidationPrice),
    afterLiquidationPrice: afterLiquidationPrice && formatCryptoBalance(afterLiquidationPrice),
    belowCurrentPrice: belowCurrentPrice && formatDecimalAsPercent(belowCurrentPrice.abs()),
  }

  const contentCardSettings: ContentCardProps = {
    title: t('ajna.position-page.borrow.common.overview.liquidation-price'),
    value: `${formatted.liquidationPrice}`,
    unit: `${priceFormat}`,
    change: {
      isLoading,
      value: afterLiquidationPrice && [
        '',
        `${formatted.afterLiquidationPrice}`,
        `${priceFormat} ${t('system.cards.common.after')}`,
      ],
      ...(withTooltips &&
        afterLiquidationPrice &&
        !afterLiquidationPrice.isZero() && {
          tooltip: `${afterLiquidationPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`,
        }),
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

  if (withTooltips && !liquidationPrice.isZero()) {
    contentCardSettings.valueTooltip = `${liquidationPrice.dp(DEFAULT_TOKEN_DIGITS)} ${priceFormat}`
  }

  if (belowCurrentPrice && !liquidationPrice.isZero()) {
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
