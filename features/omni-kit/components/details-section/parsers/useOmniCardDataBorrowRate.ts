import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataBorrowRateParams extends OmniContentCardDataWithModal {
  borrowRate: BigNumber
  afterBorrowRate?: BigNumber
}

export function useOmniCardDataBorrowRate({
  borrowRate,
  afterBorrowRate,
  modal,
}: OmniCardDataBorrowRateParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.borrow-rate.title' },
    value: formatDecimalAsPercent(borrowRate),
    ...(afterBorrowRate && {
      change: [formatDecimalAsPercent(afterBorrowRate)],
    }),
    modal,
  }
}
