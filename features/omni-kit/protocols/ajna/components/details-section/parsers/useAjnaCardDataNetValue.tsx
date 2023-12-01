import type { AjnaCumulativesData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { AjnaCardDataNetValueModal } from 'features/omni-kit/protocols/ajna/components/details-section'
import React from 'react'

interface AjnaCardDataNetValueParams {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: AjnaCumulativesData
  netValue: BigNumber
  pnl?: BigNumber
}

export function useAjnaCardDataNetValue({
  collateralPrice,
  collateralToken,
  cumulatives,
  netValue,
  pnl,
}: AjnaCardDataNetValueParams): OmniContentCardExtra {
  return {
    modal: (
      <AjnaCardDataNetValueModal
        collateralPrice={collateralPrice}
        collateralToken={collateralToken}
        cumulatives={cumulatives}
        netValue={netValue}
        pnl={pnl}
      />
    ),
  }
}
