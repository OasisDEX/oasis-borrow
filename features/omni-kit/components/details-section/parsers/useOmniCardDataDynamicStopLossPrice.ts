import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataDynamicStopPriceParams extends OmniContentCardDataWithModal {
  dynamicStopPrice?: BigNumber
  ratioToLiquidationPrice?: BigNumber
  priceFormat: string
  afterDynamicStopPrice?: BigNumber
}

export function useOmniCardDataDynamicStopLossPrice({
  dynamicStopPrice,
  afterDynamicStopPrice,
  ratioToLiquidationPrice,
  priceFormat,
  modal,
}: OmniCardDataDynamicStopPriceParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.dynamic-stop-loss-price.title' },
    value: dynamicStopPrice ? formatCryptoBalance(dynamicStopPrice) : '-',
    ...(afterDynamicStopPrice && {
      change: [formatCryptoBalance(afterDynamicStopPrice), priceFormat],
    }),
    ...(ratioToLiquidationPrice &&
      !ratioToLiquidationPrice.isZero() &&
      dynamicStopPrice && {
        unit: priceFormat,
        footnote: [
          '',
          formatCryptoBalance(ratioToLiquidationPrice.abs()),
          {
            key: `omni-kit.content-card.dynamic-stop-loss-price.footnote-${
              ratioToLiquidationPrice.gt(zero) ? 'above' : 'below'
            }`,
          },
        ],
      }),
    modal,
  }
}
