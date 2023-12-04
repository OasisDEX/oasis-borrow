import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataAverageApyParams {
  afterAverageApy?: BigNumber
  averageApy?: BigNumber
  days: string
}

export function useOmniCardDataAverageApy({
  afterAverageApy,
  averageApy,
  days,
}: OmniCardDataAverageApyParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.average-apy.title', values: { days } },
    value: averageApy ? formatDecimalAsPercent(averageApy) : '-',
    ...(afterAverageApy && {
      change: [formatDecimalAsPercent(afterAverageApy)],
    }),
  }
}
