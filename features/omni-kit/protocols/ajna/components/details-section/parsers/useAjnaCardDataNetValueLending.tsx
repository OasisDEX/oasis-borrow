import type { AjnaCumulativesData } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import type { OmniContentCardExtra } from 'features/omni-kit/components/details-section'
import { OmniMultiplyNetValueModal } from 'features/omni-kit/components/details-section/modals/OmniMultiplyNetValueModal'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

interface AjnaCardDataNetValueLendingParams {
  collateralPrice: BigNumber
  collateralToken: string
  cumulatives: AjnaCumulativesData & {
    borrowCumulativeCollateralWithdraw: BigNumber
    borrowCumulativeCollateralDeposit: BigNumber
  } // update this in the lib
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
        netValueTokenPrice={collateralPrice}
        netValueToken={collateralToken}
        cumulatives={{
          cumulativeDepositUSD: cumulatives.borrowCumulativeDepositUSD,
          cumulativeWithdrawUSD: cumulatives.borrowCumulativeWithdrawUSD,
          cumulativeFeesUSD: cumulatives.borrowCumulativeFeesUSD,
          cumulativeWithdrawInCollateralToken: cumulatives.borrowCumulativeCollateralWithdraw,
          cumulativeDespositInCollateralToken: cumulatives.borrowCumulativeCollateralDeposit,
          cumulativeFeesInCollateralToken:
            cumulatives.borrowCumulativeFeesUSD.dividedBy(collateralPrice), // fix when cumulativeFeesInCollateralToken is available
        }}
        netValueUSD={netValue}
        pnl={pnl}
        pnlUSD={pnlUSD}
        theme={ajnaExtensionTheme}
      />
    ),
  }
}
