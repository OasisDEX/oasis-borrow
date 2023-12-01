import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { AjnaCardDataLtvModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import React from 'react'

interface AjnaCardDataLoanToValueParams {
  ltv: BigNumber
  maxLtv?: BigNumber
}

export function useAjnaCardDataLoanToValue({
  ltv,
  maxLtv,
}: AjnaCardDataLoanToValueParams): OmniContentCardExtra {
  return {
    modal: <AjnaCardDataLtvModal ltv={ltv} maxLtv={maxLtv} />,
  }
}
