import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataLiquidationPriceParams {
  afterLiquidationPrice?: BigNumber
  liquidationPrice: BigNumber
  ratioToCurrentPrice?: BigNumber
  unit: string
}

export function useOmniCardDataLiquidationPrice({
  afterLiquidationPrice,
  liquidationPrice,
  ratioToCurrentPrice,
  unit,
}: OmniCardDataLiquidationPriceParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.liquidation-price.title' },
    value: formatCryptoBalance(liquidationPrice),
    unit,
    ...(afterLiquidationPrice && {
      change: [formatCryptoBalance(afterLiquidationPrice), unit],
    }),
    ...(ratioToCurrentPrice &&
      !ratioToCurrentPrice.isZero() && {
        footnote: [
          formatDecimalAsPercent(ratioToCurrentPrice),
          {
            key: `omni-kit.content-card.liquidation-price.footer-${
              ratioToCurrentPrice.gt(zero) ? 'below' : 'above'
            }`,
          },
        ],
      }),
  }
}
