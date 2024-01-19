import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataLiquidationPriceParams extends OmniContentCardDataWithModal {
  afterLiquidationPrice?: BigNumber
  liquidationPrice: BigNumber
  ratioToCurrentPrice?: BigNumber
  unit: string
}

export function useOmniCardDataLiquidationPrice({
  afterLiquidationPrice,
  liquidationPrice,
  modal,
  ratioToCurrentPrice,
  unit,
}: OmniCardDataLiquidationPriceParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.liquidation-price.title' },
    value: formatCryptoBalance(liquidationPrice),
    unit,
    ...(afterLiquidationPrice && {
      change: ['', formatCryptoBalance(afterLiquidationPrice), unit],
    }),
    ...(ratioToCurrentPrice &&
      !liquidationPrice.isZero() &&
      !ratioToCurrentPrice.isZero() && {
        footnote: [
          '',
          formatDecimalAsPercent(ratioToCurrentPrice.abs()),
          {
            key: `omni-kit.content-card.liquidation-price.footnote-${
              ratioToCurrentPrice.gt(zero) ? 'below' : 'above'
            }`,
          },
        ],
      }),
    modal,
  }
}
