import BigNumber from 'bignumber.js'
import {
  ChangeVariantType,
  ContentCardProps,
  DetailsSectionContentCard,
} from 'components/DetailsSectionContentCard'
import { formatAmount, formatPercent } from 'helpers/formatters/format'
import { useTranslation } from 'next-i18next'

import { zero } from '../../../helpers/zero'

interface ContentCardLiquidationPriceProps {
  liquidationPrice: BigNumber
  liquidationPriceCurrentPriceDifference?: BigNumber
  change?: {
    changeVariant: ChangeVariantType
    afterLiquidationPrice: BigNumber
  }
}

export function ContentCardLiquidationPrice({
  liquidationPrice,
  liquidationPriceCurrentPriceDifference,
  change,
}: ContentCardLiquidationPriceProps) {
  const { t } = useTranslation()

  const contentCardSettings: ContentCardProps = {
    title: t('system.liquidation-price'),
    value: `$${formatAmount(liquidationPrice, 'USD')}`,
  }

  if (change) {
    contentCardSettings.change = {
      value: `$${formatAmount(change.afterLiquidationPrice || zero, 'USD')}`,
      variant: change.changeVariant,
    }
  }
  if (liquidationPriceCurrentPriceDifference) {
    contentCardSettings.footnote = t('system.cards.liquidation-price.footnote', {
      amount: formatPercent(liquidationPriceCurrentPriceDifference.times(100).absoluteValue(), {
        precision: 2,
        roundMode: BigNumber.ROUND_DOWN,
      }),
      level: liquidationPriceCurrentPriceDifference.lt(zero) ? t('above') : t('below'),
    })
  }

  return <DetailsSectionContentCard {...contentCardSettings} />
}
