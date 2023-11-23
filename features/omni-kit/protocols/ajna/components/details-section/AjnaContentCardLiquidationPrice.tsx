import type BigNumber from 'bignumber.js'
import { DEFAULT_TOKEN_DIGITS } from 'components/constants'
import type { ContentCardProps } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { DetailsSectionContentSimpleModal } from 'components/DetailsSectionContentSimpleModal'
import type { OmniContentCardCommonProps } from 'features/omni-kit/components/details-section/types'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface AjnaContentCardLiquidationPriceProps extends OmniContentCardCommonProps {
  afterLiquidationPrice?: BigNumber
  belowCurrentPrice?: BigNumber
  liquidationPrice: BigNumber
  priceFormat: string
  withTooltips?: boolean
}

export function AjnaContentCardLiquidationPrice({
  afterLiquidationPrice,
  belowCurrentPrice,
  changeVariant,
  isLoading,
  liquidationPrice,
  modalTheme,
  priceFormat,
  withTooltips,
}: AjnaContentCardLiquidationPriceProps) {
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
      <DetailsSectionContentSimpleModal
        title={t('ajna.position-page.borrow.common.overview.liquidation-price')}
        description={t('ajna.position-page.borrow.common.overview.liquidation-price-modal-desc')}
        value={`${formatted.liquidationPrice} ${priceFormat}`}
        theme={modalTheme}
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
