import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'
import { zero } from 'helpers/zero'

interface OmniCardDataStopLossLtvParams extends OmniContentCardDataWithModal {
  loanToValue: BigNumber
  stopLossLtv?: BigNumber
  ratioToPositionLtv?: BigNumber
  afterStopLossLtv?: BigNumber
}

export function useOmniCardDataStopLossLtv({
  stopLossLtv,
  loanToValue,
  afterStopLossLtv,
  ratioToPositionLtv,
  modal,
}: OmniCardDataStopLossLtvParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.stop-loss-ltv.title' },
    value: stopLossLtv ? formatDecimalAsPercent(stopLossLtv) : '-',
    ...(afterStopLossLtv && {
      change: [formatDecimalAsPercent(afterStopLossLtv)],
    }),
    ...(ratioToPositionLtv &&
      !loanToValue.isZero() &&
      !ratioToPositionLtv.isZero() && {
        footnote: [
          '',
          formatDecimalAsPercent(ratioToPositionLtv.abs()),
          {
            key: `omni-kit.content-card.stop-loss-ltv.footnote-${
              ratioToPositionLtv.gt(zero) ? 'below' : 'above'
            }`,
          },
        ],
      }),
    modal,
  }
}
