import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataLiquidationPriceParams extends OmniContentCardDataWithModal {
  afterLiquidationRatio?: BigNumber
  liquidationRatio: BigNumber
  ratioToCurrentPrice?: BigNumber
  priceFormat: string
}

export function useOmniCardDataLiquidationRatio({
  afterLiquidationRatio,
  liquidationRatio,
  modal,
  ratioToCurrentPrice,
  priceFormat,
}: OmniCardDataLiquidationPriceParams): OmniContentCardBase {
  const unit = `${formatDecimalAsPercent(ratioToCurrentPrice || zero)} ${
    ratioToCurrentPrice?.gt(zero) ? 'below' : 'above'
  } current ratio`
  return {
    title: { key: 'omni-kit.content-card.liquidation-ratio.title' },
    value: formatCryptoBalance(liquidationRatio),
    unit: priceFormat,
    footnote: [unit],
    ...(afterLiquidationRatio && {
      change: ['', formatCryptoBalance(afterLiquidationRatio)],
    }),
    modal,
  }
}
