import type { MorphoPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import {
  OmniContentCardLiquidationPrice,
  OmniContentCardLtv,
  OmniContentCardNetBorrowCost,
  OmniContentCardNetValue,
} from 'features/omni-kit/components/details-section'
import type { OmniFlow } from 'features/omni-kit/types'
import { one, zero } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface MorphoOmniDetailsSectionContentProps {
  quotePrice: BigNumber
  collateralPrice: BigNumber
  isSimulationLoading?: boolean
  isShort: boolean
  quoteToken: string
  collateralToken: string
  position: MorphoPosition
  simulation?: MorphoPosition
  changeVariant: 'positive' | 'negative'
  interestRate: BigNumber
  flow: OmniFlow
  liquidationPenalty: BigNumber
}

export const MorphoDetailsSectionContent: FC<MorphoOmniDetailsSectionContentProps> = ({
  quotePrice,
  collateralPrice,
  isSimulationLoading,
  isShort,
  quoteToken,
  collateralToken,
  position,
  simulation,
  changeVariant,
  interestRate,
  flow,
  liquidationPenalty,
}) => {
  return (
    <>
      <OmniContentCardLiquidationPrice
        liquidationPriceInDebt={position.liquidationPrice}
        afterLiquidationPriceInDebt={simulation?.liquidationPrice}
        liquidationPriceInCollateral={normalizeValue(one.div(position.liquidationPrice))}
        afterLiquidationPriceInCollateral={
          simulation?.liquidationPrice && normalizeValue(one.div(simulation.liquidationPrice))
        }
        collateralPrice={collateralPrice}
        quotePrice={quotePrice}
        collateralToken={collateralToken}
        quoteToken={quoteToken}
        isShort={isShort}
        liquidationPenalty={liquidationPenalty}
      />
      <OmniContentCardLtv
        loanToValue={position.riskRatio.loanToValue}
        // TODO to be defined
        liquidationThreshold={new BigNumber(0.93)}
        maxLoanToValue={position.maxRiskRatio.loanToValue}
        afterLoanToValue={simulation?.riskRatio.loanToValue}
        automation={{
          isStopLossEnabled: false,
          isAutomationDataLoaded: false,
        }}
      />
      <OmniContentCardNetBorrowCost
        netBorrowCost={interestRate}
        netBorrowCostInUSDC={zero}
        quoteToken={quoteToken}
      />
      <OmniContentCardNetValue
        isLoading={isSimulationLoading}
        netValue={position.netValue}
        afterNetValue={simulation?.netValue}
        changeVariant={changeVariant}
        pnl={position.pnl.withoutFees}
        showPnl={flow === 'manage'}
      />
    </>
  )
}
