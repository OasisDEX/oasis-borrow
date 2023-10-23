import type { MorphoPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import BigNumber from 'bignumber.js'
import { ContentCardLiquidationPriceV2 } from 'components/vault/detailsSection/ContentCardLiquidationPriceV2'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { ContentCardNetBorrowCost } from 'components/vault/detailsSection/ContentCardNetBorrowCost'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
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
      <ContentCardLiquidationPriceV2
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
      <ContentCardLtv
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
      <ContentCardNetBorrowCost
        netBorrowCost={interestRate}
        netBorrowCostInUSDC={zero}
        quoteToken={quoteToken}
      />
      <ContentCardNetValue
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
