import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataLtvParams {
  afterLtv?: BigNumber
  ltv: BigNumber
  maxLtv?: BigNumber
}

export function useOmniCardDataLtv({
  afterLtv,
  ltv,
  maxLtv,
}: OmniCardDataLtvParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.ltv.title' },
    value: formatDecimalAsPercent(ltv),
    ...(afterLtv && {
      change: [formatDecimalAsPercent(afterLtv)],
    }),
    ...(maxLtv && {
      footnote: [{ key: 'omni-kit.content-card.ltv.footnote' }, formatDecimalAsPercent(maxLtv)],
    }),
  }
}
