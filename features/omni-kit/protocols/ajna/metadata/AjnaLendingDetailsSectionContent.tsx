import type { AjnaPosition } from '@oasisdex/dma-library'
import { normalizeValue } from '@oasisdex/dma-library'
import type BigNumber from 'bignumber.js'
import { DetailsSectionContentCardWrapper } from 'components/DetailsSectionContentCard'
import {
  OmniContentCardCollateralLocked,
  OmniContentCardPositionDebt,
} from 'features/omni-kit/components/details-section'
import {
  AjnaContentCardLiquidationPrice,
  AjnaContentCardLoanToValue,
  AjnaContentCardNetBorrowCost,
  AjnaContentCardNetValue,
  AjnaContentCardThresholdPrice,
} from 'features/omni-kit/protocols/ajna/components/details-section'
import { OmniProductType } from 'features/omni-kit/types'
import { one } from 'helpers/zero'
import type { FC } from 'react'
import React from 'react'
import { ajnaExtensionTheme } from 'theme'

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
    <DetailsSectionContentCardWrapper>
      <AjnaContentCardLiquidationPrice
        isLoading={isSimulationLoading}
        priceFormat={priceFormat}
        liquidationPrice={liquidationPrice}
        afterLiquidationPrice={afterLiquidationPrice}
        withTooltips={isOracless}
        changeVariant={changeVariant}
        {...(!isOracless && {
          belowCurrentPrice,
        })}
        modalTheme={ajnaExtensionTheme}
      />
      {isOracless ? (
        <AjnaContentCardThresholdPrice
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
          modalTheme={ajnaExtensionTheme}
        />
      ) : (
        <AjnaContentCardLoanToValue
          isLoading={isSimulationLoading}
          loanToValue={position.riskRatio.loanToValue}
          afterLoanToValue={simulation?.riskRatio.loanToValue}
          {...(shouldShowDynamicLtv && {
            dynamicMaxLtv: position.maxRiskRatio.loanToValue,
          })}
          changeVariant={changeVariant}
          modalTheme={ajnaExtensionTheme}
        />
      )}

      {productType === OmniProductType.Borrow && (
        <>
          <OmniContentCardCollateralLocked
            isLoading={isSimulationLoading}
            collateralToken={collateralToken}
            collateralLocked={position.collateralAmount}
            afterCollateralLocked={simulation?.collateralAmount}
            changeVariant={changeVariant}
            {...(!isOracless && {
              collateralLockedUSD: position.collateralAmount.times(collateralPrice),
            })}
            modalTheme={ajnaExtensionTheme}
          />
          <OmniContentCardPositionDebt
            isLoading={isSimulationLoading}
            quoteToken={quoteToken}
            positionDebt={position.debtAmount}
            afterPositionDebt={afterPositionDebt}
            changeVariant={changeVariant}
            {...(!isOracless && {
              positionDebtUSD: position.debtAmount.times(quotePrice),
            })}
            modalTheme={ajnaExtensionTheme}
          />
        </>
      )}
      {productType === OmniProductType.Multiply && (
        <>
          <AjnaContentCardNetBorrowCost
            collateralToken={collateralToken}
            quoteToken={quoteToken}
            owner={owner}
            netBorrowCost={position.pool.interestRate}
            changeVariant={changeVariant}
            modalTheme={ajnaExtensionTheme}
          />
          <AjnaContentCardNetValue
            isLoading={isSimulationLoading}
            netValue={position.collateralAmount
              .times(collateralPrice)
              .minus(position.debtAmount.times(quotePrice))}
            afterNetValue={simulation?.collateralAmount
              .times(collateralPrice)
              .minus(simulation.debtAmount.times(quotePrice))}
            position={position}
            collateralPrice={collateralPrice}
            collateralToken={collateralToken}
            // For now we need to hide P&L for proxies with many positions
            // because subgraph doesn't support it yet
            pnlNotAvailable={isProxyWithManyPositions}
            showPnl={!isOpening}
            changeVariant={changeVariant}
            modalTheme={ajnaExtensionTheme}
          />
        </>
      )}
    </DetailsSectionContentCardWrapper>
  )
}
