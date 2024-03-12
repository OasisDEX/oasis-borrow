import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'

interface OmniCardDataCurrentProfitAndLossParams extends OmniContentCardDataWithModal {
  primaryRealizedProfit?: BigNumber
  secondaryRealizedProfit?: BigNumber
  primaryUnit: string
  secondaryUnit: string
}

export function useOmniCardDataRealizedProfit({
  primaryRealizedProfit,
  secondaryRealizedProfit,
  primaryUnit,
  secondaryUnit,
  modal,
}: OmniCardDataCurrentProfitAndLossParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.realized-profit.title' },
    value: '-',
    ...(primaryRealizedProfit && {
      value: formatCryptoBalance(primaryRealizedProfit),
      unit: primaryUnit,
    }),
    ...(secondaryRealizedProfit && {
      footnote: [formatCryptoBalance(secondaryRealizedProfit), secondaryUnit],
    }),
    modal,
  }
}
