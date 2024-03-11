import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardDataWithModal,
} from 'features/omni-kit/components/details-section'
import { formatDecimalAsPercent } from 'helpers/formatters/format'

interface OmniCardDataVaultFeeParams extends OmniContentCardDataWithModal {
  afterFee?: BigNumber
  fee: BigNumber
}

export function useOmniCardDataVaultFee({
  afterFee,
  fee,
  modal,
}: OmniCardDataVaultFeeParams): OmniContentCardBase {
  return {
    title: { key: 'omni-kit.content-card.vault-fee.title' },
    value: formatDecimalAsPercent(fee),
    ...(afterFee && {
      change: [formatDecimalAsPercent(afterFee)],
    }),
    modal,
  }
}
