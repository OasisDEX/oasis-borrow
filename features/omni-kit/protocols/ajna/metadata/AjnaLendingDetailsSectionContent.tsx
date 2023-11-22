import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { ContentCardCollateralLocked } from 'features/ajna/positions/common/components/contentCards/ContentCardCollateralLocked'
import { ContentCardLiquidationPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardLiquidationPrice'
import { ContentCardLoanToValue } from 'features/ajna/positions/common/components/contentCards/ContentCardLoanToValue'
import { ContentCardNetBorrowCost } from 'features/ajna/positions/common/components/contentCards/ContentCardNetBorrowCost'
import { ContentCardNetValue } from 'features/ajna/positions/common/components/contentCards/ContentCardNetValue'
import { ContentCardPositionDebt } from 'features/ajna/positions/common/components/contentCards/ContentCardPositionDebt'
import { ContentCardThresholdPrice } from 'features/ajna/positions/common/components/contentCards/ContentCardThresholdPrice'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'

interface AjnaDetailsSectionContentProps {
  afterPositionDebt?: BigNumber
  changeVariant: 'positive' | 'negative'
  collateralPrice: BigNumber
  collateralToken: string
  isOpening: boolean
  isOracless: boolean
  isProxyWithManyPositions: boolean
  isShort: boolean
  isSimulationLoading?: boolean
  owner: string
  position: AjnaPosition
  priceFormat: string
  productType: OmniProductType
  quotePrice: BigNumber
  quoteToken: string
  shouldShowDynamicLtv: boolean
  simulation?: AjnaPosition
  thresholdPrice: BigNumber
}

export const AjnaLendingDetailsSectionContent: FC<AjnaDetailsSectionContentProps> = ({
  afterPositionDebt,
  changeVariant,
  collateralPrice,
  collateralToken,
  isOpening,
  isOracless,
  isProxyWithManyPositions,
  isShort,
  isSimulationLoading,
  owner,
  position,
  priceFormat,
  productType,
  quotePrice,
  quoteToken,
  shouldShowDynamicLtv,
  simulation,
  thresholdPrice,
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
      {productType === OmniProductType.Borrow && (
        <>
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
      )}

      {productType === OmniProductType.Multiply && (
        <>
          <ContentCardNetBorrowCost
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            owner={owner}
            netBorrowCost={position.pool.interestRate}
            changeVariant={changeVariant}
          />
          <ContentCardNetValue
            isLoading={isSimulationLoading}
            netValue={position.collateralAmount
              .times(collateralPrice)
              .minus(position.debtAmount.times(quotePrice))}
            afterNetValue={simulation?.collateralAmount
              .times(collateralPrice)
              .minus(simulation?.debtAmount.times(quotePrice))}
            pnl={position.pnl.withoutFees}
            // For now we need to hide P&L for proxies with many positions
            // because subgraph doesn't support it yet
            pnlNotAvailable={isProxyWithManyPositions}
            showPnl={!isOpening}
            changeVariant={changeVariant}
          />
        </>
      )}
    </>
  )
}
