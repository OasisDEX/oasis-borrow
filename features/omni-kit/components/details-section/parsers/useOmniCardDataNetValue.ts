import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatUsdValue } from 'helpers/formatters/format'

interface OmniCardDataNetValueParams {
  afterNetValue?: BigNumber
  netValue: BigNumber
  pnlUSD?: BigNumber
}

export function useOmniCardDataNetValue({
  afterNetValue,
  netValue,
  pnlUSD,
}: OmniCardDataNetValueParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.net-value.title' },
    value: formatUsdValue(netValue),
    ...(afterNetValue && {
      change: [formatUsdValue(afterNetValue)],
    }),
    ...(pnlUSD && {
      footnote: [{ key: 'omni-kit.content-card.net-value.footnote' }, formatUsdValue(pnlUSD)],
    }),
  }
}
