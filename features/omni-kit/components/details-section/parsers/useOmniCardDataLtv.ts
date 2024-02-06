import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataLtvParams extends OmniContentCardDataWithModal {
  afterLtv?: BigNumber
  ltv: BigNumber
  maxLtv?: BigNumber
}

export function useOmniCardDataLtv({
  afterLtv,
  ltv,
  maxLtv,
  modal,
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
    modal,
  }
}
