import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance, formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataDynamicStopPriceParams extends OmniContentCardDataWithModal {
  nextDynamicTriggerPrice?: BigNumber
  triggerLtv?: BigNumber
  priceFormat: string
  afterNextDynamicTriggerPrice?: BigNumber
}

export function useOmniCardDataNextDynamicTriggerPrice({
  nextDynamicTriggerPrice,
  afterNextDynamicTriggerPrice,
  triggerLtv,
  priceFormat,
  modal,
}: OmniCardDataDynamicStopPriceParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.next-dynamic-trigger-price.title' },
    value: nextDynamicTriggerPrice ? formatCryptoBalance(nextDynamicTriggerPrice) : '-',
    ...(afterNextDynamicTriggerPrice && {
      change: [formatCryptoBalance(afterNextDynamicTriggerPrice), priceFormat],
    }),
    ...(triggerLtv &&
      !triggerLtv.isZero() &&
      nextDynamicTriggerPrice && {
        unit: priceFormat,
        footnote: [
          {
            key: `omni-kit.content-card.next-dynamic-trigger-price.footnote`,
            values: {
              percentage: formatDecimalAsPercent(triggerLtv.abs()),
            },
          },
        ],
      }),
    modal,
  }
}
