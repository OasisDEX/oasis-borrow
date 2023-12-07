import type { AjnaCumulativesData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import React from 'react'

interface AjnaCardDataNetValueLendingParams {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: AjnaCumulativesData
  netValue: BigNumber
  pnl?: BigNumber
  pnlUSD?: BigNumber
}

export function useAjnaCardDataNetValueLending({
  collateralPrice,
  collateralToken,
  cumulatives,
  netValue,
  pnl,
  pnlUSD,
}: AjnaCardDataNetValueLendingParams): OmniContentCardExtra {
  return {
    modal: (
      <OmniMultiplyNetValueModal
        collateralPrice={collateralPrice}
        collateralToken={collateralToken}
        cumulatives={{
          cumulativeDepositUSD: cumulatives.borrowCumulativeDepositUSD,
          cumulativeWithdrawUSD: cumulatives.borrowCumulativeWithdrawUSD,
          cumulativeFeesUSD: cumulatives.borrowCumulativeFeesUSD,
        }}
        translatePrefix="ajna.content-card.net-value"
        netValue={netValue}
        pnl={pnl}
        pnlUSD={pnlUSD}
      />
    ),
  }
}
