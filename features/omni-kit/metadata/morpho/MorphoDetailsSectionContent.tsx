import type { MorphoPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { ContentCardLtv } from 'components/vault/detailsSection/ContentCardLtv'
import { ContentCardNetBorrowCost } from 'components/vault/detailsSection/ContentCardNetBorrowCost'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
import type { OmniFlow } from 'features/omni-kit/types/common.types'
import { one, zero } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface MorphoOmniDetailsSectionContentProps {
  isSimulationLoading?: boolean
  isOracless: boolean
  isShort: boolean
  priceFormat: string
  quoteToken: string
  position: MorphoPosition
  simulation?: MorphoPosition
  changeVariant: 'positive' | 'negative'
  interestRate: BigNumber
  flow: OmniFlow
}

export const MorphoDetailsSectionContent: FC<MorphoOmniDetailsSectionContentProps> = ({
  isSimulationLoading,
  isOracless,
  isShort,
  priceFormat,
  quoteToken,
  position,
  simulation,
  changeVariant,
  interestRate,
  flow,
}) => {
  const liquidationPrice = isShort
    ? normalizeValue(one.div(position.liquidationPrice))
    : position.liquidationPrice
  const belowCurrentPrice = one.minus(
    isShort
      ? normalizeValue(one.div(position.liquidationToMarketPrice))
      : position.liquidationToMarketPrice,
  )

  const afterLiquidationPrice =
    simulation?.liquidationPrice &&
    (isShort ? normalizeValue(one.div(simulation.liquidationPrice)) : simulation.liquidationPrice)
  return (
    <>
      <ContentCardLiquidationPrice
        isLoading={isSimulationLoading}
        priceFormat={priceFormat}
        liquidationPrice={liquidationPrice}
        afterLiquidationPrice={afterLiquidationPrice}
        withTooltips={isOracless}
        changeVariant={changeVariant}
        {...(!isOracless && {
          belowCurrentPrice,
        })}
      />
      <ContentCardLtv
        loanToValue={position.riskRatio.loanToValue}
        liquidationThreshold={zero}
        maxLoanToValue={zero}
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
