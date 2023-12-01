import type BigNumber from 'bignumber.js'
import type { OmniContentCardBase } from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'

interface OmniCardDataNetValueParams {
  afterNetValue?: BigNumber
  netValue: BigNumber
  pnl?: BigNumber
}

export function useOmniCardDataNetValue({
  afterNetValue,
  netValue,
  pnl,
}: OmniCardDataNetValueParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.net-value.title' },
    value: `$${formatCryptoBalance(netValue)}`,
    ...(afterNetValue && {
      change: [`$${formatCryptoBalance(afterNetValue)}`],
    }),
    ...(pnl && {
      footnote: [
        { key: 'omni-kit.content-card.net-value.footnote' },
        `$${formatCryptoBalance(pnl)}`,
      ],
    }),
  }
}
