import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { AjnaCardDataTotalEarningsModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import React from 'react'

interface AjnaCardDataTotalEarningsParams {
  quoteToken: string
  withFees?: BigNumber
  withoutFees: BigNumber
}

export function useAjnaCardDataTotalEarnings({
  quoteToken,
  withFees,
  withoutFees,
}: AjnaCardDataTotalEarningsParams): OmniContentCardExtra {
  return {
    modal: (
      <AjnaCardDataTotalEarningsModal
        quoteToken={quoteToken}
        withFees={withFees}
        withoutFees={withoutFees}
      />
    ),
  }
}
