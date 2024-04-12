import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'

interface OmniCardDataCurrentProfitAndLossParams extends OmniContentCardDataWithModal {
  primaryPnlValue?: BigNumber
  secondaryPnLValue?: BigNumber
  primaryUnit: string
  secondaryUnit: string
}

export function useOmniCardDataCurrentProfitAndLoss({
  primaryPnlValue,
  secondaryPnLValue,
  primaryUnit,
  secondaryUnit,
  modal,
}: OmniCardDataCurrentProfitAndLossParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.current-pnl.title' },
    value: '-',
    ...(primaryPnlValue && {
      value: formatCryptoBalance(primaryPnlValue),
      unit: primaryUnit,
    }),
    ...(secondaryPnLValue && {
      footnote: [formatCryptoBalance(secondaryPnLValue), secondaryUnit],
    }),
    modal,
  }
}
