import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataBorrowRateParams {
  borrowRate: BigNumber
}

export function useOmniCardDataBorrowRate({
  borrowRate,
}: OmniCardDataBorrowRateParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.borrow-rate.title' },
    value: formatDecimalAsPercent(borrowRate),
  }
}
