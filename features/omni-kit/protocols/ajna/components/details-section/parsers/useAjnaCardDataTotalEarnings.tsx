import type BigNumber from 'bignumber.js'
import type {
  OmniContentCardBase,
  OmniContentCardExtra,
} from 'features/omni-kit/components/details-section'
import { AjnaCardDataTotalEarningsModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import { formatCryptoBalance } from 'helpers/formatters/format'
import React from 'react'

interface AjnaCardDataTotalEarningsParams {
  pnlUSD?: BigNumber
  quoteToken: string
  withFees?: BigNumber
  withoutFees: BigNumber
}

export function useAjnaCardDataTotalEarnings({
  pnlUSD,
  quoteToken,
  withFees,
  withoutFees,
}: AjnaCardDataTotalEarningsParams): OmniContentCardBase & OmniContentCardExtra {
  return {
    title: { key: 'ajna.content-card.total-earnings.title' },
    value: formatCryptoBalance(withoutFees),
    unit: quoteToken,
    ...(pnlUSD && {
      footnote: [
        { key: 'ajna.content-card.total-earnings.footnote' },
        `$${formatCryptoBalance(pnlUSD)}`,
      ],
    }),
    modal: (
      <AjnaCardDataTotalEarningsModal
        quoteToken={quoteToken}
        withFees={withFees}
        withoutFees={withoutFees}
      />
    ),
  }
}
