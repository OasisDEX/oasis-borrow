import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { ContentCardCollateralLocked } from 'features/ajna/positions/common/components/contentCards/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardPositionDebt } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionDebt'
import { ContentCardThresholdPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardThresholdPrice'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface AjnaOmniDetailsSectionContentProps {
  isSimulationLoading?: boolean
  thresholdPrice: BigNumber
  collateralPrice: BigNumber
  collateralToken: string
  isOracless: boolean
  isShort: boolean
  priceFormat: string
  quotePrice: BigNumber
  quoteToken: string
  position: AjnaPosition
  simulation?: AjnaPosition
  changeVariant: 'positive' | 'negative'
  afterPositionDebt?: BigNumber
  shouldShowDynamicLtv: boolean
}

export const AjnaOmniLendingDetailsSectionContent: FC<AjnaOmniDetailsSectionContentProps> = ({
  isSimulationLoading,
  thresholdPrice,
  collateralPrice,
  collateralToken,
  isOracless,
  isShort,
  priceFormat,
  quotePrice,
  quoteToken,
  position,
  simulation,
  changeVariant,
  afterPositionDebt,
  shouldShowDynamicLtv,
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
      {isOracless ? (
        <ContentCardThresholdPrice
          isLoading={isSimulationLoading}
          thresholdPrice={thresholdPrice}
          debtAmount={position.debtAmount}
          collateralAmount={position.collateralAmount}
          afterThresholdPrice={simulation?.thresholdPrice}
          priceFormat={priceFormat}
          withTooltips
          changeVariant={changeVariant}
          {...(shouldShowDynamicLtv && {
            lup: position.pool.lup,
          })}
        />
      ) : (
        <ContentCardLoanToValue
          isLoading={isSimulationLoading}
          loanToValue={position.riskRatio.loanToValue}
          afterLoanToValue={simulation?.riskRatio.loanToValue}
          {...(shouldShowDynamicLtv && {
            dynamicMaxLtv: position.maxRiskRatio.loanToValue,
          })}
          changeVariant={changeVariant}
        />
      )}
      <ContentCardCollateralLocked
        isLoading={isSimulationLoading}
        collateralToken={collateralToken}
        collateralLocked={position.collateralAmount}
        afterCollateralLocked={simulation?.collateralAmount}
        changeVariant={changeVariant}
        {...(!isOracless && {
          collateralLockedUSD: position.collateralAmount.times(collateralPrice),
        })}
      />
      <ContentCardPositionDebt
        isLoading={isSimulationLoading}
        quoteToken={quoteToken}
        positionDebt={position.debtAmount}
        afterPositionDebt={afterPositionDebt}
        changeVariant={changeVariant}
        {...(!isOracless && {
          positionDebtUSD: position.debtAmount.times(quotePrice),
        })}
      />
    </>
  )
}
