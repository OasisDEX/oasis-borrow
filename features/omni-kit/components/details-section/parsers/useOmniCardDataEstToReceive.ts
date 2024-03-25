import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'

interface OmniCardDataDynamicStopPriceParams extends OmniContentCardDataWithModal {
  estimatedToReceive?: BigNumber
  afterEstimatedToReceive?: BigNumber
  estimatedToReceiveFooter?: BigNumber
  primaryUnit: string
  secondaryUnit: string
}

export function useOmniCardDataEstToReceive({
  estimatedToReceive,
  afterEstimatedToReceive,
  estimatedToReceiveFooter,
  primaryUnit,
  secondaryUnit,
  modal,
}: OmniCardDataDynamicStopPriceParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.estimated-to-receive.title' },
    value: estimatedToReceive ? formatCryptoBalance(estimatedToReceive) : '-',
    ...(afterEstimatedToReceive && {
      change: [formatCryptoBalance(afterEstimatedToReceive), primaryUnit],
    }),
    ...(estimatedToReceiveFooter &&
      !estimatedToReceiveFooter.isZero() &&
      estimatedToReceive && {
        unit: primaryUnit,
        footnote: [formatCryptoBalance(estimatedToReceiveFooter), secondaryUnit],
      }),
    modal,
  }
}
