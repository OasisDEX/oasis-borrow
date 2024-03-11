import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'

interface OmniCardTrailingDistanceParams {
  trailingDistance?: BigNumber
  priceFormat: string
  afterTrailingDistance?: BigNumber
}

export function useOmniCardTrailingDistance({
  trailingDistance,
  afterTrailingDistance,
  priceFormat,
}: OmniCardTrailingDistanceParams): OmniContentCardBase {
  return {
    title: { key: 'protection.trailing-distance' },
    value: trailingDistance ? formatCryptoBalance(trailingDistance) : '-',
    ...(afterTrailingDistance && {
      change: [formatCryptoBalance(afterTrailingDistance), priceFormat],
    }),
    ...(trailingDistance && {
      unit: priceFormat,
    }),
  }
}
