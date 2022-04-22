import BigNumber from 'bignumber.js'
import { ChangeVariantType, DetailsSectionContentCard } from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

import { zero } from '../../../helpers/zero'

interface ContentCardLiquidationPriceProps {
  liquidationPrice: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  changeColor?: ChangeVariantType
}

export function ContentCardLiquidationPrice({
  liquidationPrice,
  liquidationPriceCurrentPriceDifference,
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()

  const formatted = {
    price: `$${formatAmount(liquidationPrice, 'USD')}`,
    difference:
      liquidationPriceCurrentPriceDifference &&
      formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
  }

  const contentCardSettings = {
    title: t('system.liquidation-price'),
    value: formatted.price,
    footnote:
      liquidationPriceCurrentPriceDifference &&
      t('system.cards.liquidation-price.footnote', {
        amount: formatted.difference,
        level: liquidationPriceCurrentPriceDifference.lt(zero) ? t('above') : t('below'),
      }),
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
